import { Progress } from '@backend/processors/events/interface'
import { existsProm, getClipInfoCachePath } from '@backend/tools/fs'
import { RegManMain } from '@general/register/main'
import { isFilenameValid } from '@general/tools'
import { getHex } from '@general/tools/fs'
import { MainGlobals } from '@Globals/mainGlobals'
import { Storage } from '@Globals/storage'
import { type execa as execaType } from "execa"
import glob from "fast-glob"
import fs from "fs"
import { copyFile, rename, rm, stat, unlink, writeFile } from 'fs/promises'
import path from "path"
import { MainLogger } from 'src/interfaces/mainLogger'
import { CloudManager } from '../cloud'
import { CloudClip } from '../cloud/interface'
import { GameManager } from '../game'
import { GeneralGame } from '../game/interface'
import { RecordManager } from '../obs/core/record'
import { addToCached, getHexCached } from './fs'
import { getClipInfo, getClipInfoPath, getClipVideoPath, getClipVideoProcessingPath, getVideoIco, getVideoInfo, getVideoPath } from './func'
import { Clip, ClipCutInfo, ClipProcessingInfo, ClipRaw } from './interface'
import { VideoManager } from './video'

const log = MainLogger.get("Backend", "Managers", "Clips")
export class ClipManager extends VideoManager {
    private static clipInfoCache = new Map<string, Clip>()
    private static execa: typeof execaType = null
    private static processing = new Map<string, ClipProcessingInfo>()

    static async cut(clipObj: ClipCutInfo, onProgress: (prog: Progress) => void) {
        // eslint-disable-next-line prefer-const
        let { videoName, start, end, clipName } = clipObj
        videoName = videoName.split(".mkv").join("")
        clipName = clipName.split(".mp4").join("")

        if (!isFilenameValid(videoName) || !isFilenameValid(clipName)) {
            log.error("Can't cut, invalid Video or Clip Name", videoName, clipName)
            throw new Error(`Invalid VideoName (${videoName}) or ClipName ${clipName}`)
        }


        const clipRoot = Storage.get("clip_path")
        const videoPath = getVideoPath(clipRoot, videoName)
        const clipOut = getClipVideoPath(clipRoot, clipName)
        const clipProcessing = getClipVideoProcessingPath(clipRoot, clipName)

        if (await existsProm(clipOut))
            throw new Error("A clip with that name exists already.")

        if (await existsProm(clipProcessing)) {
            log.silly("Clip processing", clipProcessing, "exists already, unlinking...")
            await unlink(clipProcessing)
        }

        if (!(await existsProm(videoPath))) {
            log.error("Can't cut, video with path", videoPath, "does not exist.")
            throw new Error(`Video with name ${videoName} does not exist in clip directory`)
        }

        this.processing.set(clipOut, {
            progress: {
                status: "Preparing to cut clip...",
                percent: 0
            },
            info: {
                ...clipObj,
                clipPath: clipOut
            }
        })


        const info = await getVideoInfo(clipRoot, videoName + ".mkv")
        const withClippedExt = getClipInfoPath(clipRoot, clipName)


        const ffmpegExe = MainGlobals.ffmpegExe
        const commandRunner = this.execa ?? (await import("execa")).execa

        const args = ["-n", "-i", videoPath, "-ss", start.toString(), "-to", end.toString(), "-progress", "pipe:1", clipProcessing]
        log.log("Cutting clip from vidoePath", videoPath, "Output", clipProcessing, "with info", info, "and clip info file", withClippedExt)
        log.log("Running ffmpeg:", ffmpegExe, args.join(" "))
        const commandOut = commandRunner(ffmpegExe, args)
        //? Duration in microseconds because ffmpeg is stupid and titles it as milliseconds
        const duration = (end - start) * 1000 * 1000

        let lastOutput = ""
        commandOut.stdout?.on("data", chunk => {
            lastOutput += chunk.toString("utf-8")
            if (!lastOutput.includes("progress="))
                return

            const splitSegments = lastOutput
                .split(" ").join("")
                .split("\r").join("")
                .split("\n").map(e => e.split("="))
                .map(([key, val]) => ([key, isNaN(val as any as number) ? val : parseFloat(val)]))

            const data = Object.fromEntries(splitSegments)
            //? FFMPEG is stupid thats why its in microseconds
            const curr = data?.["out_time_ms"]

            log.silly("Clip", videoName, curr / duration * 100, "%")

            lastOutput = ""
            const prog = {
                status: "Cutting clip...",
                percent: curr / duration * 0.9
            }

            this.processing.set(clipOut, {
                progress: prog,
                info: {
                    ...clipObj,
                    clipPath: clipOut
                }
            })
            onProgress(prog)
        })


        await commandOut

        onProgress({
            status: "Calculating hash...",
            percent: .9
        })

        log.debug("Removing processing prefix")
        await rename(clipProcessing, clipOut)

        const hex = await getHex(clipOut)

        this.processing.delete(clipOut)


        const originalIcoPath = getVideoIco(clipRoot, videoName)
        const newIcoPath = getVideoIco(clipRoot, clipName)

        if (await existsProm(originalIcoPath))
            await copyFile(originalIcoPath, newIcoPath)

        await writeFile(withClippedExt, JSON.stringify({
            modified: Date.now(),
            gameId: info?.gameId,
            original: videoName,
            start: start,
            end: end,
            duration: end - start,
            hex,
            originalInfo: info
        } as ClipRaw))

        log.log("Clip was being cut successfully.")
        onProgress({
            status: "Clip successfully cut.",
            percent: 1
        })
    }

    static async delete(videoClipName: string) {
        if (videoClipName.includes(".."))
            throw new Error("Invalid path")

        log.silly("Deleting clip", videoClipName, "...")
        const rootPath = Storage.get("clip_path")
        const clipPath = path.join(rootPath, videoClipName)
        const icoPath = getVideoIco(rootPath, path.basename(videoClipName.replace(".clipped.mp4", "").replace(".mkv", "")))
        const infoPath = clipPath + ".json"

        if (fs.existsSync(clipPath))
            await rm(clipPath)

        if (fs.existsSync(infoPath))
            await rm(infoPath)

        if (fs.existsSync(icoPath))
            await rm(icoPath)


        log.log("Deleted clip/video", videoClipName, "!")
        RegManMain.send("clips_update", { videoName: null, end: null, start: null, clipName: videoClipName }, null)
    }

    static async getClipThumbnail(clipName: string) {
        const baseName = clipName.replace(".clipped.mp4", "")
        log.debug("Getting clip thumbnail: ", baseName, isFilenameValid(baseName))
        if (!isFilenameValid(baseName))
            return null

        const root = Storage.get("clip_path")
        const file = getClipVideoPath(root, baseName)
        return await ClipManager.fromPathToThumbnail(file)
    }

    static async listClips() {
        const clipPath = Storage.get("clip_path")
        const globPattern = `${clipPath}/**/*.clipped.mp4!(.json)`.split("\\").join("/")
        const files = (await glob(globPattern))
            .map(e => path.resolve(e))

        log.info("Loading total of", files.length, "clips... (", globPattern, ")")
        const rawFiles = (await Promise.all(
            files
                .filter(e => e.endsWith(".mp4"))
                .filter(e => !Array.from(this.processing.values()).some(x => path.basename(x.info.clipPath) === path.basename(e)))
                .map(async e => {
                    const stats = await stat(e)
                    return {
                        modified: stats.mtimeMs,
                        file: e
                    }
                })
        ).catch(e => {
            log.error(e)
            throw e
        }))

        const usage = await CloudManager.getUsage()
        const detectable = await GameManager.getDetectableGames()
        const uploaded: CloudClip[] | null = await CloudManager.list().catch(e => {
            log.error("Could not get uploaded clips", e)
            return null
        })

        const res = await Promise.all(
            rawFiles
                .map(async ({ modified, file }) => {
                    let clipInfo = this.clipInfoCache.get(file) as Clip | null
                    const clipName = path.basename(file)
                    const icoExists = clipInfo?.icoName && await existsProm(path.join(clipPath, clipInfo.icoName))

                    if (!clipInfo || !icoExists || clipInfo?.tooLarge === undefined || clipInfo?.tooLarge === null) {
                        // eslint-disable-next-line prefer-const
                        let { gameId, hex, ...rawGameInfo } = await getClipInfo(clipPath, clipName)

                        if (!gameId && rawGameInfo.originalInfo)
                            gameId = rawGameInfo.originalInfo.gameId

                        if (!gameId && rawGameInfo.original) {
                            const appended = rawGameInfo.original.endsWith(".mkv") ? rawGameInfo.original : rawGameInfo.original + ".mkv"
                            const videoInfo = await getVideoInfo(clipPath, appended)
                            gameId = videoInfo?.gameId
                        }


                        const detectableCurr = detectable.find(e => e.id === gameId)
                        let gameInfo = null as GeneralGame

                        if (detectableCurr)
                            gameInfo = {
                                type: "detectable",
                                game: detectableCurr
                            }

                        let icoPath = null
                        const win = RecordManager.instance.getWindowInfo()
                            .get(gameId)
                        if (win) {
                            gameInfo = {
                                type: "window",
                                game: win
                            }

                            icoPath = getVideoIco(clipPath, path.basename(file, ".clipped.mp4"))
                            if (!(await existsProm(icoPath))) {
                                const { original } = rawGameInfo
                                const originalIcoPath = getVideoIco(clipPath, path.basename(original))
                                const originalIcoAvailable = await existsProm(originalIcoPath)

                                console.log("original", originalIcoAvailable, originalIcoPath)
                                if (originalIcoAvailable) {
                                    const clipIco = icoPath
                                    icoPath = originalIcoPath

                                    copyFile(originalIcoPath, clipIco)
                                } else
                                    icoPath = null
                            }
                        }

                        addToCached(file, hex)
                        const cloudVid = uploaded.find(e => e.hex === hex)

                        const clipSize = (await stat(file)).size
                        clipInfo = {
                            ...rawGameInfo,
                            clipName,
                            cloudOnly: false,
                            game: gameInfo,
                            icoName: icoPath && path.basename(icoPath),
                            uploaded: uploaded ? !!cloudVid : null,
                            cloudId: cloudVid?.id,
                            tooLarge: clipSize > usage.maxClipSize
                        }
                        this.clipInfoCache.set(file, clipInfo)
                    }

                    const fileName = path.basename(file)
                    const hex = await getHexCached(file)
                    const cloudVid = uploaded.find(e => e.hex === hex)

                    return {
                        original: fileName.split("_UUID_").shift(),
                        ...clipInfo,
                        clipName: fileName,
                        hex,
                        uploaded: uploaded ? !!cloudVid : null,
                        cloudId: cloudVid?.id,
                        modified,
                        cloudOnly: false
                    } as Clip & { hex?: string }
                })
        )

        const cloudOnly = uploaded.filter(e => !res.some(x => e.hex === x.hex))
            .map(({ dcGameId, title, uploadDate, windowInfo, id }) => {
                const gameInfo = dcGameId ? {
                    type: "discord",
                    game: detectable.find(e => e.id === dcGameId)
                } : {
                    type: "window",
                    game: windowInfo
                }

                return {
                    clipName: title,
                    game: gameInfo,
                    uploaded: true,
                    cloudOnly: true,
                    modified: new Date(uploadDate).getTime(),
                    icoName: windowInfo?.icon,
                    original: null,
                    tooLarge: false,
                    cloudId: id
                } as Clip
            })
        const unsortedClips = res.concat(cloudOnly)
        return unsortedClips
            .sort((a, b) => b.modified - a.modified)
    }

    static async renameClip(original: string, newName: string) {
        if (!isFilenameValid(newName))
            throw new Error("Invalid new name")

        const root = Storage.get("clip_path")
        const originalPath = getClipVideoPath(root, original)
        const renamedPath = getClipVideoPath(root, newName)

        log.debug("Renaming from", originalPath, "to", renamedPath)
        if (await existsProm(renamedPath))
            throw new Error("A clip with that name exists already")

        if (!(await existsProm(originalPath)))
            throw new Error("Original clip does not exist")

        const originalInfo = getClipInfoPath(root, original)
        const renamedInfo = getClipInfoPath(root, newName)

        await rename(originalInfo, renamedInfo)
        await rename(originalPath, renamedPath)

        const oldData = this.imageData.get(originalPath)
        if (oldData) {
            this.imageData.set(renamedPath, oldData)
            this.imageData.delete(originalPath)
        }
    }

    static register() {
        super.register()

        RegManMain.onPromise("clips_list", () => this.listClips())
        RegManMain.onPromise("clips_delete", (_, clipName) => this.delete(clipName))
        RegManMain.onPromise("clips_cut", (_, e) => this.cut(e, prog => RegManMain.send("clips_update", e, prog)))
        RegManMain.onPromise("clips_cutting", async () => Array.from(this.processing.entries()))
        RegManMain.onPromise("clips_thumbnail", (_, clipName) => this.getClipThumbnail(clipName))
        RegManMain.onPromise("clips_rename", (_, original, newName) => this.renameClip(original, newName))
        RegManMain.onPromise("clips_exists", (_, n) => {
            if (!isFilenameValid(n))
                return Promise.resolve(false)

            const rootPath = Storage.get("clip_path")
            const finalPath = path.resolve(rootPath, n + ".clipped.mp4")
            return existsProm(finalPath)
        })


        const cachePath = getClipInfoCachePath()
        const exists = fs.existsSync(cachePath)
        if (exists)
            try {
                const jsonData = JSON.parse(fs.readFileSync(cachePath, "utf-8"))
                this.clipInfoCache = new Map(jsonData)
            } catch (e) {
                log.error("Could not load cache from path", cachePath, e)
            }
    }

    static shutdown() {
        super.shutdown()

        log.info("Saving Clip Cache")
        fs.writeFileSync(getClipInfoCachePath(), JSON.stringify(Array.from(this.clipInfoCache.entries())))
    }
}
