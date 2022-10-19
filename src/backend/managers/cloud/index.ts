import { existsProm } from '@backend/tools/fs';
import { RegManMain } from '@general/register/main';
import { MainGlobals } from '@Globals/mainGlobals';
import { Storage } from '@Globals/storage';
import { clipboard } from 'electron';
import FormData from "form-data";
import { createReadStream } from 'fs';
import fs from 'fs/promises';
import got, { Progress as GotProgress, Response } from "got";
import path from "path";
import { MainLogger } from 'src/interfaces/mainLogger';
import HttpStatusCode from 'src/types/HttpStatusCodes';
import { AuthManager } from '../auth';
import { getHexCached } from '../clip/fs';
import { getClipInfo, getClipVideoPath, getVideoIco, getVideoInfo } from '../clip/func';
import { GameManager } from '../game';
import { RecordManager } from '../obs/core/record';
import { WindowInformation } from '../obs/Scene/interfaces';
import { CloudClip, CloudClipStatus, CloudUsage } from './interface';

const log = MainLogger.get("Managers", "Cloud")
const CACHE_EXPIRE = 30 * 1000
export class CloudManager {
    static uploading = [] as CloudClipStatus[]
    static cached = null as CloudClip[]
    static cachedUsage = null as CloudUsage

    static register() {
        RegManMain.onPromise("cloud_upload", (_, clipName) => this.uploadClip(clipName));
        RegManMain.onPromise("cloud_delete", (_, clipName) => this.delete(clipName));
        RegManMain.onPromise("cloud_list", () => this.list());
        RegManMain.onPromise("cloud_uploading", async () => this.getUploading())
        RegManMain.onPromise("cloud_share", (_, clipName) => this.share(clipName))
        RegManMain.onPromise("cloud_usage", () => this.getUsage())
        RegManMain.onPromise("cloud_rename", (_, originalName, newName) => {
            return this.rename(originalName, newName)
        })
    }

    static async getUsage() {
        if (this.cachedUsage)
            return this.cachedUsage

        const cookies = await AuthManager.getCookies()
        if (!cookies)
            throw new Error("Not authenticated.")

        const res = await got(`${MainGlobals.baseUrl}/api/clip/usage`, { headers: { cookie: cookies } })
            .json<CloudUsage>()

        setTimeout(() => { this.cachedUsage = null }, CACHE_EXPIRE)
        this.cachedUsage = res
        return res
    }

    static getUploading() {
        return this.uploading as ReadonlyArray<CloudClipStatus>
    }

    static async share(clipName: string) {
        const clips = await this.list()
        const rootPath = Storage.get("clip_path")
        const clipPath = getClipVideoPath(rootPath, clipName)
        const fileHex = await getHexCached(clipPath)

        const matchingClips = clips.filter(e => e.hex === fileHex)
        if (matchingClips.length === 0)
            throw new Error("Matching clips could not be found")

        const { id } = matchingClips[0]
        clipboard.writeText(`${MainGlobals.baseUrl}/clip/${id}`)
    }

    static async uploadClip(clipName: string) {
        const rootPath = Storage.get("clip_path")
        const clipPath = getClipVideoPath(rootPath, clipName)

        const cookieHeader = await AuthManager.getCookies()
        if (!cookieHeader)
            throw new Error("Not authenticated.")

        if (this.uploading.some(({ clipName: e }) => e === clipName))
            throw new Error("Already uploading this clip.")

        if (!existsProm(clipPath))
            throw new Error("Clip not found.")

        let { original, gameId } = await getClipInfo(rootPath, clipName + ".clipped.mp4") ?? {}
        if (original && !gameId)
            gameId = (await getVideoInfo(rootPath, original))?.gameId

        let windowInfo = null as WindowInformation | null
        const detectable = await GameManager.getDetectableGames()
        if (!detectable)
            log.warn("Could not get detectable games.")
        let { id: discordId } = detectable?.find(e => e?.id === gameId) ?? {}

        console.log("Game id is", gameId)
        if (gameId && !discordId) {
            windowInfo = RecordManager.instance.getWindowInfo().get(gameId)
            log.info("Found window info", windowInfo)
        }

        const { size } = await fs.stat(clipPath)
        const body = new FormData()

        body.append("file", createReadStream(clipPath))
        if (discordId)
            body.append("discordGameId", discordId)
        if (windowInfo) {
            console.log("Appending window info")
            const { className, title, productName, full_exe } = windowInfo
            body.append("windowInformationClassName", className)
            body.append("windowInformationExecutable", path.basename(full_exe))
            body.append("windowInformationTitle", productName ?? title)
            const iconPath = getVideoIco(rootPath, original)
            if (await existsProm(iconPath)) {
                const hex = await fs.readFile(iconPath, "hex")
                body.append("windowInformationIcon", hex)
            }
        }

        log.info("Uploading clip", clipName, "and size", size, "...")
        this.uploading.push({
            clipName,
            progress: { percent: 0, status: "Initializing..." }
        })

        RegManMain.send("cloud_update", this.uploading)

        const prog = got.stream.post(`${MainGlobals.baseUrl}/api/clip/upload?title=${encodeURIComponent(clipName)}&fileSize=${size}`, {
            headers: { cookie: cookieHeader },
            body,
            throwHttpErrors: false,
        })

        prog.on("uploadProgress", (p: GotProgress) => {
            const index = this.uploading.findIndex(e => e.clipName === clipName)
            console.log("Upload progress", p, index)
            if (index === -1)
                return

            this.uploading[index] = {
                clipName,
                progress: {
                    percent: p.percent,
                    status: "Uploading clip..."
                }
            }

            RegManMain.send("cloud_update", this.uploading)
        })

        const chunks = [] as Buffer[]
        prog.on("data", e => chunks.push(e))

        await new Promise<void>((resolve, reject) => {
            prog.on("error", err => { log.error(err); reject(err) })
            prog.on("response", (response: Response) => {
                const handle = () => {
                    const rawBody = chunks.length === 0 ? response.rawBody.toString("utf-8") :
                        Buffer.concat(chunks).toString("utf-8")
                    try {
                        const body = JSON.parse(rawBody)
                        console.log("ResponseCode is", response.statusCode)
                        if (response.statusCode === 200) {
                            const { id } = body
                            log.info("Clip uploaded with id", id)

                            return resolve()
                        }

                        const { error } = body ?? {}
                        if (error) {
                            log.error("Could not upload clip", error)
                            return reject(new Error(error))
                        }

                        log.error("Unknown error", body)
                        return reject(new Error("Unknown error"))
                    } catch (e) {
                        if (response.statusCode === HttpStatusCode.PAYLOAD_TOO_LARGE)
                            return reject(new Error("Clip is too large."))

                        if (response.statusCode === HttpStatusCode.INSUFFICIENT_STORAGE)
                            return reject(new Error("The clipture server do not have any storage left :("))

                        log.error(e)
                        reject(new Error("Could not parse response body."))
                    }
                }

                if (!response.complete) {
                    if (response.isPaused())
                        response.resume()

                    response.on("end", () => handle())
                }
                else
                    handle()
            })
        }).finally(() => {
            this.uploading = this.uploading.filter(e => e.clipName !== clipName)
            this.clearCache()

            this.getUsage()
                .then(e => RegManMain.send("cloud_usageUpdate", e))
            RegManMain.send("cloud_update", this.uploading)
        });
    }

    static clearCache() {
        log.info("Clearing cache...")
        this.cached = null
        this.cachedUsage = null
    }

    static async delete(clipName: string) {
        const clips = await this.list()
        const rootPath = Storage.get("clip_path")
        const clipPath = getClipVideoPath(rootPath, clipName)
        const fileHex = await getHexCached(clipPath)
        const cookies = await AuthManager.getCookies()
        if (!cookies)
            throw new Error("Not authenticated.")


        const toDelete = clips.filter(e => e.hex === fileHex)

        log.info("Deleting clips:", JSON.stringify(toDelete))
        const proms = toDelete
            .map(({ id }) => got(`${MainGlobals.baseUrl}/api/clip/delete?id=${id}`, {
                headers: { cookie: cookies }
            }).json().catch(e => { throw new Error(`Invalid response: ${e?.response?.statusCode} - ${e?.response?.body}, ${e}`) }))

        const res = await Promise.all(proms)
        log.silly("Result of deleting:", res)
        this.clearCache()

        this.getUsage()
            .then(e => RegManMain.send("cloud_usageUpdate", e))
    }

    static async list() {
        console.log("List cached is", !!this.cached)
        if (this.cached)
            return this.cached

        const cookie = await AuthManager.getCookies()
        const res = await got(`${MainGlobals.baseUrl}/api/clip/list`, {
            headers: {
                cookie: cookie
            }
        }).json<CloudClip[]>()

        this.cached = res
        setTimeout(() => { this.cached = null; console.log("Invalidating cache...") }, CACHE_EXPIRE)
        return res
    }

    static async rename(originalName: string, newName: string) {
        log.debug("Renaming cloud item from", originalName, "to", newName)
        const root = Storage.get("clip_path")
        const originalPath = getClipVideoPath(root, originalName)

        const list = await this.list()
        const originalHex = await getHexCached(originalPath);

        const found = list.find(e => e.hex === originalHex)
        if (!found)
            throw new Error("Could not find id in cloud.")

        const cookies = await AuthManager.getCookies()
        if (!cookies)
            throw new Error("Not authenticated.")

        return got(`${MainGlobals.baseUrl}/api/clip/rename?title=${encodeURIComponent(newName)}&id=${found.id}`, {
            headers: {
                cookie: cookies
            }
        }).json()
    }
}