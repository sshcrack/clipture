import { existsProm, getSharedImageCachePath, getVideoInfoCachePath } from '@backend/tools/fs'
import { RegManMain } from '@general/register/main'
import { isFilenameValid } from '@general/tools'
import { MainGlobals } from '@Globals/mainGlobals'
import { Storage } from '@Globals/storage'
import glob from "fast-glob"
import fs from "fs"
import { readFile, stat, writeFile } from 'fs/promises'
import path from "path"
import { MainLogger } from 'src/interfaces/mainLogger'
import { getLocalizedT } from 'src/locales/backend_i18n'
import { generateThumbnail, lookupThumbnail } from "thumbsupply"
import { GameManager } from '../game'
import { GeneralGame } from '../game/interface'
import { RecordManager } from '../obs/core/record'
import { getVideoIco, getVideoInfo, getVideoInfoPath, getVideoPath } from './func'
import { Video, VideoInfo } from './interface'

const log = MainLogger.get("Backend", "Managers", "Videos")

export class VideoManager {
    private static videoDisplayNameCache = new Map<string, string>()
    private static videoInfoCache = new Map<string, GeneralGame>()
    public static imageData = new Map<string, string>()

    static async renameVideo(original: string, newName: string) {
        const t = getLocalizedT("backend", "clip")
        if (!isFilenameValid(newName))
            throw new Error(t("invalid_name"))

        log.info("Renaming video from", original, newName)
        const root = Storage.get("clip_path")
        const originalPath = getVideoPath(root, original)
        const renamedPath = getVideoPath(root, newName)

        log.debug("Renaming from", originalPath, "to", renamedPath)
        if (await existsProm(renamedPath))
            throw new Error(t("exists"))

        if (!(await existsProm(originalPath)))
            throw new Error(t("original_not_found"))

        const currInfoPath = getVideoInfoPath(root, original + ".mkv")
        const currInfo = await getVideoInfo(root, original + ".mkv") ?? {}

        const newInfo = {
            ...currInfo,
            displayName: newName
        } as VideoInfo

        log.debug("Video rename new Info is", newInfo)
        writeFile(currInfoPath, JSON.stringify(newInfo))

        Array.from(this.videoDisplayNameCache.keys())
            .forEach(e => {
                if (e.includes(original + ".mkv"))
                    this.videoDisplayNameCache.delete(e)
            })
    }

    static async listVideos() {
        const videoPath = Storage.get("clip_path")
        const globPattern = `${videoPath}/**/*!(.clipped).mkv`.split("\\").join("/")
        const files = (await glob(globPattern))
            .map(e => path.resolve(e))

        const current = await RecordManager.instance.getCurrent()
        const sorted = (await Promise.all(
            files
                .map(e => path.resolve(e))
                .filter(e => path.basename(e) !== current?.videoName)
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
        console.log("Video List:", JSON.stringify(sorted))
        return Promise.all(sorted.map(async ({ modified, file }) => {
            let gameInfo = this.videoInfoCache.get(file) as GeneralGame | null
            let displayName = this.videoDisplayNameCache.get(file) as string | null
            let bookmarks = null

            if (!gameInfo || !displayName) {
                const info = await getVideoInfo(videoPath, path.basename(file))

                displayName = info?.displayName
                bookmarks = info?.bookmarks
                const detec = detectable?.find(e => e.id === info?.gameId)
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

                this.videoInfoCache.set(file, gameInfo)
            }

            const clipName = path.basename(file)
            const icoRoot = path.basename(file, path.extname(file))
            const icoPath = getVideoIco(videoPath, icoRoot)
            const icoAvailable = await existsProm(icoPath)

            return {
                modified,
                videoName: clipName,
                video: file,
                game: gameInfo ?? null,
                bookmarks: bookmarks ?? null,
                icoName: icoAvailable ? path.basename(icoPath) : null,
                displayName: displayName
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
        return await this.fromPathToThumbnail(file)
    }

    static register() {
        RegManMain.onPromise("video_thumbnail", (_, videoName) => this.getVideoThumbnail(videoName))
        RegManMain.onPromise("video_list", () => this.listVideos())
        RegManMain.onPromise("video_rename", (_, original, newName) => this.renameVideo(original, newName))


        const videoCachePath = getVideoInfoCachePath()
        const videoCacheExists = fs.existsSync(videoCachePath)
        if (videoCacheExists)
            try {
                const jsonData = JSON.parse(fs.readFileSync(videoCachePath, "utf-8"))
                this.videoInfoCache = new Map(jsonData)
            } catch (e) {
                log.error("Could not load cache from path", videoCachePath, e)
            }
    }


    static async fromPathToThumbnail(file: string) {
        if (this.imageData.has(file))
            return this.imageData.get(file)

        console.log("Generating thumbnail", file)
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

        const thumbnail = await readFile(thumbnailFile, "base64")
        this.imageData.set(file, thumbnail)

        return thumbnail
    }

    static shutdown() {
        log.info("Saving Video Cache and Image data")
        fs.writeFileSync(getVideoInfoCachePath(), JSON.stringify(Array.from(this.videoInfoCache.entries())))
        fs.writeFileSync(getSharedImageCachePath(), JSON.stringify(Array.from(this.imageData.entries())))
    }
}