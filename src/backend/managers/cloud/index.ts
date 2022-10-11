import { existsProm } from '@backend/tools/fs';
import { RegManMain } from '@general/register/main';
import { MainGlobals } from '@Globals/mainGlobals';
import { Storage } from '@Globals/storage';
import FormData from "form-data";
import { createReadStream } from 'fs';
import fs from 'fs/promises';
import got, { Progress as GotProgress, Response } from "got";
import path from "path";
import { MainLogger } from 'src/interfaces/mainLogger';
import { AuthManager } from '../auth';
import { getHexCached } from '../clip/fs';
import { getClipInfo, getClipVideoPath, getVideoIco, getVideoInfo } from '../clip/func';
import { GameManager } from '../game';
import { RecordManager } from '../obs/core/record';
import { WindowInformation } from '../obs/Scene/interfaces';
import { CloudClip, CloudClipStatus } from './interface';

const log = MainLogger.get("Managers", "Cloud")
const CACHE_EXPIRE = 30 * 1000
export class CloudManager {
    static uploading = [] as CloudClipStatus[]
    static cached = null as CloudClip[]

    static register() {
        RegManMain.onPromise("cloud_upload", (_, clipName) => this.uploadClip(clipName));
        RegManMain.onPromise("cloud_delete", (_, clipName) => this.delete(clipName));
        RegManMain.onPromise("cloud_list", () => this.list());
        RegManMain.onPromise("cloud_uploading", async () => this.getUploading())
    }

    static getUploading() {
        return this.uploading as ReadonlyArray<CloudClipStatus>
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

        const { original } = await getClipInfo(rootPath, clipName + ".clipped.mp4") ?? {}
        if (!original)
            throw new Error("Clip info could not be found.")

        const { gameId } = (original && await getVideoInfo(rootPath, original)) ?? {}
        let windowInfo = null as WindowInformation | null

        const detectable = await GameManager.getDetectableGames()
        if (!detectable)
            log.warn("Could not get detectable games.")
        let { id: discordId } = detectable?.find(e => e?.id === gameId) ?? {}

        if (gameId && !discordId)
            windowInfo = RecordManager.instance.getWindowInfo().get(gameId)

        const { size } = await fs.stat(clipPath)
        const body = new FormData()

        body.append("file", createReadStream(clipPath))
        if (discordId)
            body.append("discordGameId", discordId)
        if (windowInfo) {
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
                    try {
                        const rawBody = chunks.length === 0 ? response.rawBody.toString("utf-8") :
                            Buffer.concat(chunks).toString("utf-8")

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
            this.cached = null
            RegManMain.send("cloud_update", this.uploading)
        });
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
            }).json().catch(e => { throw new Error(`Invalid response: ${e?.response?.statusCode} - ${e?.response?.body}, ${e}`)}))

        const res = await Promise.all(proms)
        log.silly("Result of deleting:", res)
        this.cached = null
    }

    static async list() {
        if (this.cached)
            return this.cached

        const cookie = await AuthManager.getCookies()
        const res = await got(`${MainGlobals.baseUrl}/api/clip/list`, {
            headers: {
                cookie: cookie
            }
        }).json<CloudClip[]>()

        this.cached = res
        setTimeout(() => { this.cached = null }, CACHE_EXPIRE)
        return res
    }
}