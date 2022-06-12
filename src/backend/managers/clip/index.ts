import { getClipCachePath, getClipImagePath } from '@backend/tools/fs'
import { RegManMain } from '@general/register/main'
import { MainGlobals } from '@Globals/mainGlobals'
import { Storage } from '@Globals/storage'
import { protocol, ProtocolRequest, ProtocolResponse } from 'electron'
import fs from "fs"
import { readFile } from 'fs/promises'
import glob from "glob"
import path from "path"
import { MainLogger } from 'src/interfaces/mainLogger'
import { generateThumbnail } from "thumbsupply"
import { promisify } from "util"
import { DetectableGame } from '../obs/Scene/interfaces'
import { Clip, getClipInfo } from './interface'

const globProm = promisify(glob)
const log = MainLogger.get("Backend", "Managers", "Clips")
export class ClipManager {
    private static imageData = new Map<string, string>()
    private static cache = new Map<string, DetectableGame>()

    static async list() {
        const clipPath = Storage.get("clip_path")
        const globPattern = `${clipPath}/**/*.mkv`
        const files = (await globProm(globPattern))
            .map(e => path.resolve(e))

        return await Promise.all(
            files
                .map(e => path.resolve(e))
                .map(async file => {
                    log.silly("Getting thumbnail for file", file, "has", this.imageData.has(file))
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
                    } else { log.silly("Thumbnail already exists for", file) }


                    let gameInfo = this.cache.get(file) as DetectableGame | null
                    if (!gameInfo)
                        gameInfo = await getClipInfo(clipPath, path.basename(file))

                    const clipName = path.basename(file)
                    return {
                        clipName: clipName,
                        clip: file,
                        info: gameInfo ?? null,
                        thumbnail: "data:image/png;base64," + this.imageData.get(file)
                    }
                }
                )
        )
            .catch(e => {
                log.error(e)
                throw e
            }) as Clip[]
    }

    static register() {
        RegManMain.onPromise("clips_list", () => this.list())
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
        log.silly("Clip procotol handler", requestedPath, clipPath, check)

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