import { existsProm } from '@backend/tools/fs';
import { RegManMain } from '@general/register/main';
import { MainGlobals } from '@Globals/mainGlobals';
import { Storage } from '@Globals/storage';
import fs from 'fs/promises';
import got from "got";
import path from "path"
import { MainLogger } from 'src/interfaces/mainLogger';
import { AuthManager } from '../auth';
import { getClipInfo, getClipInfoPath, getClipVideoPath, getVideoIco, getVideoInfo } from '../clip/func';
import { RecordManager } from '../obs/core/record';
import { WindowInformation } from '../obs/Scene/interfaces';
import { CloudClip } from './interface';
import FormData from "form-data"
import { createReadStream } from 'fs';
import { GameManager } from '../game';

const log = MainLogger.get("Managers", "Cloud")
export class CloudManager {
    static register() {
        RegManMain.onPromise("cloud_upload", (_, clipName) => this.uploadClip(clipName));
        RegManMain.onPromise("cloud_delete", (_, clipName) => this.delete(clipName));
        RegManMain.onPromise("cloud_list", () => this.list());
    }

    static async uploadClip(clipName: string) {
        log.info("Uploading clip", clipName, "...")
        const rootPath = Storage.get("clip_path")
        const clipPath = getClipVideoPath(rootPath, clipName)
        const infoPath = getClipInfoPath(rootPath, clipName)

        const cookieHeader = await AuthManager.getCookies()
        if (!cookieHeader)
            throw new Error("Not authenticated.")

        if (!existsProm(clipPath))
            throw new Error("Clip not found.")

        const { original } = await getClipInfo(rootPath, clipName)
        const { gameId } = (original && await getVideoInfo(rootPath, original)) ?? {}
        let windowInfo = null as WindowInformation | null
        let { id: discordId } = (await GameManager.getDetectableGames()).find(e => e.id === gameId)

        if (gameId && !discordId)
            windowInfo = RecordManager.instance.getWindowInfo().get(gameId)

        const { size } = await fs.stat(clipPath)
        const body = new FormData()

        body.append("file", createReadStream(clipPath))
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

        await got(`${MainGlobals.baseUrl}/api/clip/upload?title=${encodeURIComponent(clipName)}&fileSize=${size}`, {
            headers: { cookie: cookieHeader },
            body
        })
    }

    static async delete(clipName: string) {

    }

    static async list() {
        const cookie = await AuthManager.getCookies()
        const res = await got(`${MainGlobals.baseUrl}/api/clip/list`, {
            headers: {
                cookie: cookie
            }
        }).json<CloudClip[]>()

        return res
    }
}