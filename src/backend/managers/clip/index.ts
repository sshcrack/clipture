import { Progress } from '@backend/processors/events/interface'
import { existsProm, getClipInfoCachePath, getSharedImageCachePath, getVideoInfoCachePath } from '@backend/tools/fs'
import { RegManMain } from '@general/register/main'
import { isFilenameValid } from '@general/tools'
import { MainGlobals } from '@Globals/mainGlobals'
import { Storage } from '@Globals/storage'
import { protocol, ProtocolRequest, ProtocolResponse } from 'electron'
import { type execa as execaType } from "execa"
import fs from "fs"
import { readFile, rename, rm, stat } from 'fs/promises'
import glob from "fast-glob"
import path from "path"
import { MainLogger } from 'src/interfaces/mainLogger'
import { generateThumbnail, lookupThumbnail } from "thumbsupply"
import { promisify } from "util"
import { GameManager } from '../game'
import { GeneralGame } from '../game/interface'
import { RecordManager } from '../obs/core/record'
import { getClipInfo, getClipInfoPath, getClipVideoPath, getClipVideoProcessingPath, getVideoInfo, getVideoPath } from './func'
import { Clip, ClipCutInfo, ClipProcessingInfo, ClipRaw, Video } from './interface'

const globProm = promisify(glob)
const log = MainLogger.get("Backend", "Managers", "Clips")
export class ClipManager {
    private static imageData = new Map<string, string>()
    private static videoInfoCache = new Map<string, GeneralGame>()
    private static clipInfoCache = new Map<string, Clip>()
    private static execa: typeof execaType = null
    private static processing = new Map<string, ClipProcessingInfo>()

    //**********************************
    //*             CLIP
    //**********************************

    static async cut(clipObj: ClipCutInfo, onProgress: (prog: Progress) => void) {
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

        if (!existsProm(videoPath)) {
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
                percent: curr / duration
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
        log.debug("Removing processing prefix")
        await rename(clipProcessing, clipOut)
        this.processing.delete(clipOut)

        log.log("Clip was being cut successfully.")
        onProgress({
            status: "Clip successfully cut.",
            percent: 1
        })

        fs.writeFileSync(withClippedExt, JSON.stringify({
            modified: Date.now(),
            clipName: path.basename(clipOut),
            clipPath: clipOut,
            gameId: info?.gameId,
            original: videoName,
            start: start,
            end: end,
            duration: end - start
        } as ClipRaw))
    }

    static async deleteClip(clipName: string) {
        log.silly("Deleting clip", clipName, "...")
        const rootPath = Storage.get("clip_path")
        const clipPath = path.join(rootPath, clipName)
        const infoPath = clipPath + ".json"

        if (fs.existsSync(clipPath))
            await rm(clipPath)

        if (fs.existsSync(infoPath))
            await rm(infoPath)

        log.log("Deleted clip", clipName, "!")
        RegManMain.send("clips_update", { videoName: null, end: null, start: null, clipName: clipName }, null)
    }

    static async getClipThumbnail(clipName: string) {
        const baseName = clipName.replace(".clipped.mp4", "")
        console.log("Basename valid", baseName, isFilenameValid(baseName))
        if (!isFilenameValid(baseName))
            return null

        const root = Storage.get("clip_path")
        const file = getClipVideoPath(root, baseName)
        return await ClipManager.fromPathToThumbnail(file)
    }


    static async listClips() {
        const clipPath = Storage.get("clip_path")
        const globPattern = `${clipPath}/**/*.clipped.mp4!(.json)`
        const files = (await globProm(globPattern))
            .map(e => path.resolve(e))

        log.info("Loading total of", files.length, "clips...")
        const sorted = (await Promise.all(
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
        })).sort((a, b) => b.modified - a.modified)

        const detectable = await GameManager.getDetectableGames()
        return await Promise.all(
            sorted
                .map(async ({ modified, file }) => {
                    let clipInfo = this.clipInfoCache.get(file) as Clip | null
                    if (!clipInfo) {
                        const { gameId, ...rawGameInfo } = await getClipInfo(clipPath, path.basename(file))
                        const detec = detectable.find(e => e.id === gameId)
                        let gameInfo = null as GeneralGame

                        if (detec)
                            gameInfo = {
                                type: "detectable",
                                game: detec
                            }

                        const win = RecordManager.instance.getWindowInfo()
                            .get(gameId)
                        if (win)
                            gameInfo = {
                                type: "window",
                                game: win
                            }
                        clipInfo = {
                            ...rawGameInfo,
                            game: gameInfo
                        }
                    }

                    const fileName = path.basename(file)
                    return {
                        clipName: fileName,
                        original: fileName.split("_UUID_").shift(),
                        ...clipInfo,
                        modified
                    } as Clip
                })
        )
    }


    //**********************************
    //*             VIDEO
    //**********************************

    static async listVideos() {
        const videoPath = Storage.get("clip_path")
        const globPattern = `${videoPath}/**/*!(.clipped).mkv`
        const files = (await globProm(globPattern))
            .map(e => path.resolve(e))

        log.info("Loading total of", files.length, "videos...")
        const current = await RecordManager.instance.getCurrent()
        const sorted = (await Promise.all(
            files
                .map(e => path.resolve(e))
                .filter(e => e !== current?.videoPath)
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
        })).sort((a, b) => b.modified - a.modified)


        const detectable = await GameManager.getDetectableGames()
        return Promise.all(sorted.map(async ({ modified, file }) => {
            let gameInfo = this.videoInfoCache.get(file) as GeneralGame | null
            let bookmarks = null
            if (!gameInfo) {
                const info = await getVideoInfo(videoPath, path.basename(file))
                bookmarks = info?.bookmarks
                const detec = detectable.find(e => e.id === info?.gameId)
                if (detec)
                    gameInfo = {
                        type: "detectable",
                        game: detec
                    }

                const win = RecordManager.instance.getWindowInfo()
                    .get(info?.gameId)
                if (win)
                    gameInfo = {
                        type: "window",
                        game: win
                    }
            }

            const clipName = path.basename(file)
            return {
                modified,
                videoName: clipName,
                video: file,
                game: gameInfo ?? null,
                bookmarks: bookmarks ?? null
            }
        })).catch(e => {
            log.error(e)
            throw e
        }) as Promise<Video[]>
    }


    static async getVideoThumbnail(videoName: string) {
        const baseName = videoName.replace(".mkv", "")
        if (!isFilenameValid(baseName))
            return null

        const root = Storage.get("clip_path")
        const file = getVideoPath(root, baseName)
        return await ClipManager.fromPathToThumbnail(file)
    }


    static async fromPathToThumbnail(file: string) {
        if (this.imageData.has(file))
            return this.imageData.get(file)

        const options = {
            cacheDir: MainGlobals.getTempDir(),
            timestamp: "00:00:00"
        }
        let thumbnailFile = await lookupThumbnail(file, { cacheDir: options.cacheDir })
            .catch(() => false)
        if (!thumbnailFile) {
            thumbnailFile = (await generateThumbnail(file, options)
                .catch(e => {
                    if (e?.message?.includes("Invalid data found when processing input"))
                        return true

                    log.error("Failed to generate thumbnail for", file, e)
                    return false
                }))
            log.silly("Saving thumbnail for file", file, thumbnailFile)
        }

        if (thumbnailFile === true)
            this.imageData.set(file, null)
        if (!thumbnailFile || typeof thumbnailFile === "boolean")
            return null

        log.silly("Reading file", thumbnailFile, "and setting it")
        const thumbnail = await readFile(thumbnailFile, "base64")
        this.imageData.set(file, thumbnail)

        return thumbnail
    }

    static register() {
        RegManMain.onPromise("video_thumbnail", (_, videoName) => this.getVideoThumbnail(videoName))
        RegManMain.onPromise("video_list", () => this.listVideos())

        RegManMain.onPromise("clips_list", () => this.listClips())
        RegManMain.onPromise("clips_delete", (_, clipName) => this.deleteClip(clipName))
        RegManMain.onPromise("clips_cut", (_, e) => this.cut(e, prog => RegManMain.send("clips_update", e, prog)))
        RegManMain.onPromise("clips_cutting", async () => Array.from(this.processing.entries()))
        RegManMain.onPromise("clips_thumbnail", (_, clipName) => this.getClipThumbnail(clipName))
        RegManMain.onPromise("clips_exists", (_, n) => {
            if (!isFilenameValid(n))
                return Promise.resolve(false)

            const rootPath = Storage.get("clip_path")
            const finalPath = path.resolve(rootPath, n + ".clipped.mp4")
            return existsProm(finalPath)
        })

        const videoCachePath = getVideoInfoCachePath()
        const videoCacheExists = fs.existsSync(videoCachePath)
        if (videoCacheExists)
            try {
                const jsonData = JSON.parse(fs.readFileSync(videoCachePath, "utf-8"))
                this.videoInfoCache = new Map(jsonData)
            } catch (e) {
                log.error("Could not load cache from path", videoCachePath, e)
            }


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
        log.info("Saving Clip Cache and Image data")
        fs.writeFileSync(getVideoInfoCachePath(), JSON.stringify(Array.from(this.videoInfoCache.entries())))
        fs.writeFileSync(getClipInfoCachePath(), JSON.stringify(Array.from(this.clipInfoCache.entries())))
        fs.writeFileSync(getSharedImageCachePath(), JSON.stringify(Array.from(this.imageData.entries())))
    }

    static registerProtocol() {
        protocol.registerFileProtocol("clip-video-file", ClipManager.clipProtocolHandler)
    }

    static clipProtocolHandler(req: ProtocolRequest, callback: (response: (string) | (ProtocolResponse)) => void) {
        let requestedPath = decodeURIComponent(req.url.replace("clip-video-file:///", ""))
        const clipRootUrl = Storage.get("clip_path")
        const clipPath = path.join(clipRootUrl, requestedPath)

        let check = fs.existsSync(clipPath)
        if (!check || requestedPath.includes("..") || requestedPath.includes("/")) {
            callback({
                // -6 is FILE_NOT_FOUND
                // https://source.chromium.org/chromium/chromium/src/+/master:net/base/net_error_list.h
                error: -6
            });
            return;
        }

        callback({
            path: path.resolve(clipPath)
        });
    }
}
