import { AuthManager } from '@backend/managers/auth';
import { RegManMain } from '@general/register/main';
import { MainGlobals } from '@Globals/mainGlobals';
import got from 'got';
import { MainLogger } from 'src/interfaces/mainLogger';
import { CloudManager } from '..';
import { DiscoverResponse } from '../interface';
import { BasicUser, IsLikedResponse, SuccessResponse } from './interface';

const log = MainLogger.get("Managers", "Cloud", "Discover")
export class DiscoverManager {
    public static register() {
        RegManMain.onPromise("cloud_discover_list", (_, offset, limit) => this.discover({ offset, limit }))
        RegManMain.onPromise("cloud_discover_visibility", (_, id, v) => this.setVisibility(id, v))
        RegManMain.onPromise("cloud_discover_is_liked", (_, id) => this.isLiked(id))
        RegManMain.onPromise("cloud_discover_set_liked", (_, id, like) => this.setLike(id, like))
        RegManMain.onPromise("cloud_discover_get_user", (_, id) => this.getUser(id))
    }

    public static async discover({ offset, limit }: { offset: number, limit: number }) {
        return got(`${MainGlobals.baseUrl}/api/clip/discover?limit=${limit}&offset=${offset}`)
            .json<DiscoverResponse>()
            .catch(e => { throw e })
    }

    public static async getUser(cuid: string) {
        return got(`${MainGlobals.baseUrl}/api/user/get/${encodeURIComponent(cuid)}`)
            .json<BasicUser>()
    }

    public static async setLike(id: string, like: boolean) {5
        const cookies = await AuthManager.getCookies()
        if (!cookies)
            throw new Error("Not authenticated.")

        return await got(`${MainGlobals.baseUrl}/api/user/like/${encodeURIComponent(id)}/${like ? "add" : "remove"}`, {
            headers: { cookie: cookies }
        }).json<SuccessResponse>()
    }

    public static async isLiked(id: string) {
        const cookies = await AuthManager.getCookies()
        if (!cookies)
            throw new Error("Not authenticated.")

        return await got(`${MainGlobals.baseUrl}/api/user/like/${encodeURIComponent(id)}/has`, {
            headers: { cookie: cookies }
        })
            .json<IsLikedResponse>()
    }

    public static async setVisibility(id: string, isPublic: boolean) {
        log.debug("Setting visibility for cloud item", id, "to", isPublic)

        const list = await CloudManager.list()
        const found = list.find(e => e.id === id)
        if (!found)
            throw new Error("Could not find id in cloud.")

        const cookies = await AuthManager.getCookies()
        if (!cookies)
            throw new Error("Not authenticated.")

        const res = await got(`${MainGlobals.baseUrl}/api/clip/visibility/${encodeURIComponent(id)}/?public=${encodeURIComponent(isPublic)}`, {
            headers: { cookie: cookies }
        })
            .json()

        CloudManager.clearCache()
        return res
    }
}