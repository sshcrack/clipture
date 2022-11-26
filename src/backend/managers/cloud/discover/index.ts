import { AuthManager } from '@backend/managers/auth';
import { GameManager } from '@backend/managers/game';
import { CloudGeneralGame } from '@backend/managers/game/interface';
import { RegManMain } from '@general/register/main';
import { MainGlobals } from '@Globals/mainGlobals';
import got from 'got';
import { MainLogger } from 'src/interfaces/mainLogger';
import { getLocalizedT } from 'src/locales/backend_i18n';
import { CloudManager } from '..';
import { DiscoverClip, DiscoverResponse } from '../interface';
import { BasicUser, IsLikedResponse, SuccessResponse } from './interface';

const log = MainLogger.get("Managers", "Cloud", "Discover")
export class DiscoverManager {
    public static register() {
        RegManMain.onPromise("cloud_discover_list", (_, offset, limit, search) => this.discover({ offset, limit, search }))
        RegManMain.onPromise("cloud_discover_visibility", (_, id, v) => this.setVisibility(id, v))
        RegManMain.onPromise("cloud_discover_is_liked", (_, id) => this.isLiked(id))
        RegManMain.onPromise("cloud_discover_set_liked", (_, id, like) => this.setLike(id, like))
        RegManMain.onPromise("cloud_discover_get_user", (_, id) => this.getUser(id))
        RegManMain.onPromise("cloud_discover_get_clip", (_, id) => this.infoSingle(id))
    }

    public static async infoSingle(id: string) {
        const t = getLocalizedT("backend", "discover")
        if(AuthManager.isOffline())
            throw new Error(t("offline"))

        return await got(`${MainGlobals.baseUrl}/api/clip/info?id=${id}`)
            .json<DiscoverClip>()
    }

    public static async discover({ offset, limit, search }: { offset: number, limit: number, search?: string }) {
        const t = getLocalizedT("backend", "discover")
        if(AuthManager.isOffline())
            throw new Error(t("offline"))

        const url = `${MainGlobals.baseUrl}/api/clip/discover?limit=${limit}&offset=${offset}${search ? `&query=${search}` : ""}`
        const detectable = await GameManager.getDetectableGames()

        log.debug("Requesting url", url)
        return await got(url)
            .json<DiscoverResponse>()
            .then(e => {
                const newClips = e.clips.map<DiscoverClip>(x => {
                    const { dcGameId, windowInfo } = x
                    const gameInfo = dcGameId ? {
                        type: "detectable",
                        game: detectable.find(e => e.id === dcGameId)
                    } as CloudGeneralGame : {
                        type: "cloud",
                        game: windowInfo
                    } as CloudGeneralGame

                    return {
                        ...x,
                        game: gameInfo
                    }
                })


                return {
                    ...e,
                    clips: newClips
                }
            })
            .catch(e => { throw e })
    }

    public static async getUser(cuid: string) {
        const t = getLocalizedT("backend", "discover")
        if(AuthManager.isOffline())
            throw new Error(t("user_offline"))

        return await got(`${MainGlobals.baseUrl}/api/user/get/${encodeURIComponent(cuid)}`)
            .json<BasicUser>()
    }

    public static async setLike(id: string, like: boolean) {
        const t = getLocalizedT("backend", "discover")
        if(AuthManager.isOffline())
            throw new Error(t("like_offline"))

        const cookies = await AuthManager.getCookies()
        if (!cookies)
            throw new Error(t("not_authenticated"))

        return await got(`${MainGlobals.baseUrl}/api/user/like/${encodeURIComponent(id)}/${like ? "add" : "remove"}`, {
            headers: { cookie: cookies }
        }).json<SuccessResponse>()
    }

    public static async isLiked(id: string) {
        const t = getLocalizedT("backend", "discover")
        if(AuthManager.isOffline())
            return null

        const cookies = await AuthManager.getCookies()
        if (!cookies)
            throw new Error(t("not_authenticated"))

        return await got(`${MainGlobals.baseUrl}/api/user/like/${encodeURIComponent(id)}/has`, {
            headers: { cookie: cookies }
        })
            .json<IsLikedResponse>()
    }

    public static async setVisibility(id: string, isPublic: boolean) {
        const t = getLocalizedT("backend", "discover")
        if(AuthManager.isOffline())
            throw new Error(t("visibility_offline"))

        log.debug("Setting visibility for cloud item", id, "to", isPublic)

        const list = await CloudManager.list()
        const found = list.find(e => e.id === id)
        if (!found)
            throw new Error(t("id_not_found"))

        const cookies = await AuthManager.getCookies()
        if (!cookies)
            throw new Error(t("not_authenticated"))

        const res = await got(`${MainGlobals.baseUrl}/api/clip/visibility/${encodeURIComponent(id)}/?public=${encodeURIComponent(isPublic)}`, {
            headers: { cookie: cookies }
        })
            .json()

        CloudManager.clearCache()
        return res
    }
}