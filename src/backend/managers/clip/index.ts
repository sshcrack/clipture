import { Progress } from '@backend/processors/events/interface'
import { getClipCachePath, getClipImagePath } from '@backend/tools/fs'
import { RegManMain } from '@general/register/main'
import { MainGlobals } from '@Globals/mainGlobals'
import { Storage } from '@Globals/storage'
import { protocol, ProtocolRequest, ProtocolResponse } from 'electron'
import { type execa as execaType } from "execa"
import fs from "fs"
import { readFile } from 'fs/promises'
import glob from "glob"
import path from "path"
import { MainLogger } from 'src/interfaces/mainLogger'
import { generateThumbnail } from "thumbsupply"
import { promisify } from "util"
import { v4 as uuid } from "uuid"
import { DetectableGame } from '../obs/Scene/interfaces'
import { getVideoInfo, getVideoInfoPath } from './func'
import { ClipCutInfo, Video } from './interface'

const globProm = promisify(glob)
const log = MainLogger.get("Backend", "Managers", "Clips")
export class ClipManager {
    private static imageData = new Map<string, string>()
    private static cache = new Map<string, DetectableGame>()
    private static execa: typeof execaType = null
    private static processing = new Map<ClipCutInfo, Progress>()

    static async listVideos() {
        const clipPath = Storage.get("clip_path")
        const globPattern = `${clipPath}/**/*!(.clipped).mkv`
        const files = (await globProm(globPattern))
            .map(e => path.resolve(e))

        return await Promise.all(
            files
                .map(e => path.resolve(e))
                .map(async file => {
                    if (!this.imageData.has(file)) {
                        const thumbnailFile = (await generateThumbnail(file, {
                            cacheDir: MainGlobals.getTempDir(),
                            timestamp: "00:00:00"
                        })
                            .catch(e => {
                                log.error("Failed to generate thumbnail for", file, e)
                                return undefined as string
                            }))
                        if (thumbnailFile) {
                            const thumbnail = await readFile(thumbnailFile, "base64")
                            this.imageData.set(file, thumbnail)
                            log.silly("Saving thumbnail for file", file, thumbnailFile)
                        }
                    }


                    let gameInfo = this.cache.get(file) as DetectableGame | null
                    if (!gameInfo)
                        gameInfo = await getVideoInfo(clipPath, path.basename(file))

                    const clipName = path.basename(file)
                    return {
                        videoName: clipName,
                        video: file,
                        info: gameInfo ?? null,
                        thumbnail: "data:image/png;base64," + this.imageData.get(file)
                    }
                }
                )
        )
            .catch(e => {
                log.error(e)
                throw e
            }) as Video[]
    }

    static register() {
        RegManMain.onPromise("video_list", () => this.listVideos())
        RegManMain.onPromise("clips_cut", (_, e) => this.cut(e, prog => RegManMain.send("clip_update", e, prog)))
        RegManMain.onPromise("clips_cutting", async () => Array.from(this.processing.entries()))

        const cachePath = getClipCachePath()
        const exists = fs.existsSync(cachePath)
        if (exists)
            try {
                const jsonData = JSON.parse(fs.readFileSync(cachePath, "utf-8"))
                this.cache = new Map(jsonData)
            } catch (e) {
                log.error("Could not load cache from path", cachePath, e)
            }

        const imagePath = getClipImagePath()
        const imageExists = fs.existsSync(imagePath)
        if (imageExists)
            try {
                const jsonData = JSON.parse(fs.readFileSync(imagePath, "utf-8"))
                this.imageData = new Map(jsonData)
            } catch (e) {
                log.error("Could not load image data from path", imagePath, e)
            }

    }

    static shutdown() {
        log.info("Saving Clip Cache and Image data")
        fs.writeFileSync(getClipCachePath(), JSON.stringify(Array.from(this.cache.entries())))
        fs.writeFileSync(getClipImagePath(), JSON.stringify(Array.from(this.imageData.entries())))
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

    static async cut(clipObj: ClipCutInfo, onProgress: (prog: Progress) => void) {
        let { videoName, start, end } = clipObj

        log.log("Cutting clip", videoName, "from", start, "to", end)
        videoName = videoName.split("..").join("").split("/").join("").split("\\").join("")
        const id = uuid()

        const clipRoot = Storage.get("clip_path")
        const videoPath = path.join(clipRoot, videoName)
        const clipOut = path.join(clipRoot, path.basename(videoName, path.extname(videoName)) + id + ".clipped.mp4")

        const infoPath = getVideoInfoPath(clipRoot, videoName)
        const info = await getVideoInfo(clipRoot, videoName)

        const withClippedExt = infoPath.replace(".mkv.json", "") + id + ".clipped.mp4.json"


        const ffmpegExe = MainGlobals.ffmpegExe
        const commandRunner = this.execa ?? (await import("execa")).execa

        const commandOut = commandRunner(ffmpegExe, ["-n", "-i", videoPath, "-ss", start.toString(), "-to", end.toString(), "-progress", "pipe:1", clipOut])
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

            this.processing.set(clipObj, prog)
            onProgress(prog)
        })


        await commandOut
        this.processing.delete(clipObj)

        log.log("Clip was being cut successfully.")
        onProgress({
            status: "Clip successfully cut.",
            percent: 1
        })
        fs.writeFileSync(withClippedExt, JSON.stringify({
            ...info,
            original: videoName,
            start: start,
            end: end
        }))
    }
}