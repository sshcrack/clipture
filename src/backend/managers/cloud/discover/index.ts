import { AuthManager } from '@backend/managers/auth';
import { RegManMain } from '@general/register/main';
import { MainGlobals } from '@Globals/mainGlobals';
import got from 'got';
import { MainLogger } from 'src/interfaces/mainLogger';
import { CloudManager } from '..';
import { DiscoverResponse } from '../interface';
import { IsLikedResponse } from './interface';

const log = MainLogger.get("Managers", "Cloud", "Discover")
export class DiscoverManager {
    public static register() {
        RegManMain.onPromise("cloud_discover_list", (_, offset, limit) => this.discover({ offset, limit }))
        RegManMain.onPromise("cloud_discover_visibility", (_, id, v) => this.setVisibility(id, v))
        RegManMain.onPromise("cloud_discover_is_liked", (_, id) => this.isLiked(id))
        RegManMain.onPromise("cloud_discover_set_liked", (_, id, like) => this.setLike(id, like))
    }

    public static async discover({ offset, limit }: { offset: number, limit: number }) {
        return got(`${MainGlobals.baseUrl}/api/clip/discover?limit=${limit}&offset=${offset}`)
            .json<DiscoverResponse>()
            .catch(e => { throw e })
    }

    public static async setLike(id: string, like: boolean) {
        const cookies = await AuthManager.getCookies()
        if (!cookies)
            throw new Error("Not authenticated.")

        return got(`${MainGlobals.baseUrl}/api/user/like/${id}/${like ? "add" : "remove"}`, {
            headers: { cookie: cookies }
        })
    }

    public static async isLiked(id: string) {
        const cookies = await AuthManager.getCookies()
        if (!cookies)
            throw new Error("Not authenticated.")

        return got(`${MainGlobals.baseUrl}/api/user/like/${id}/has`, {
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

        const res = await got(`${MainGlobals.baseUrl}/api/clip/visibility/${id}/?public=${isPublic}`, {
            headers: { cookie: cookies }
        })
            .json()

        CloudManager.clearCache()
        return res
    }
}