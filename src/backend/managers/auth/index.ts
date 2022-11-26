import { RegManMain } from '@general/register/main';
import { getAddRemoveListener } from '@general/tools/listener';
import { MainGlobals } from '@Globals/mainGlobals';
import { Storage } from '@Globals/storage';
import { shell } from 'electron';
import got from "got";
import { MainLogger } from 'src/interfaces/mainLogger';
import { getLocalizedT } from 'src/locales/backend_i18n';
import i18n from 'src/locales/i18n';
import { v4 as uuid } from "uuid";
import { clickableNotification } from '../obs/core/backend_only_tools';
import { OfflineChangeListener, SessionData, SessionInfo, SessionStatus } from './interfaces';

const log = MainLogger.get("Backend", "Managers", "AuthManager")
const baseUrl = MainGlobals.baseUrl;
const OFFLINE_CHECK_INTERVAL = 5000
const CACHE_INVALIDATE = 2000

export class AuthManager {
    public static readonly TIMEOUT = 1000 * 60 * 10 // 10 Minutes
    public static readonly FetchInterval = 100

    private static currId = null as string
    private static offlineMode = true
    private static offlineLoopId = null as NodeJS.Timer

    private static cachedSession = undefined as SessionInfo
    private static listeners = [] as OfflineChangeListener[]

    static async addOfflineChangeListener(listener: OfflineChangeListener) {
        return getAddRemoveListener(listener, this.listeners)
    }

    static async activeOfflineCheck() {
        const isOffline = await got(MainGlobals.baseUrl, { method: "HEAD" })
            .then(() => false)
            .catch(() => true)
        return isOffline
    }

    static async offlineCheck() {
        const isOffline = await this.activeOfflineCheck()

        if (isOffline !== this.offlineMode) {
            log.info("Offline Check returned new mode:", isOffline ? "offline" : "online")
            this.listeners.map(e => e(isOffline))
        }

        this.offlineMode = isOffline
    }

    static isOffline() {
        return this.offlineMode
    }

    static shutdown() {
        if (this.offlineLoopId)
            clearInterval(this.offlineLoopId)
    }

    static async authenticate() {
        const id = uuid() + uuid()

        const signIn = `${baseUrl}/redirects/login?id=${id}`
        log.info("Opening url", signIn)
        shell.openExternal(signIn)

        const begin = Date.now()
        log.info("Starting autofetch with id", id)

        this.currId = id
        const secrets = await this.authFetch(id, begin)
        console.log("Saving secrets", secrets.map(e => e.key))
        for (const obj of secrets) {
            const { key, cookie, type } = obj;

            Storage.set(getID(type, "key"), key)
            Storage.setSecure(getID(type, "value"), cookie)
        }

        this.updateListeners()
        return id
    }

    private static updateListeners() {
        RegManMain.send("auth_update")
    }

    private static authFetch(id: string, startTime: number) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<ClientSessionInterface[]>(async (resolve, reject) => {
            const t = getLocalizedT("backend", "auth")

            if (Date.now() - startTime > this.TIMEOUT) {
                log.info("Timeout has  been exceeded", Date.now() - startTime)
                return reject(new Error(t("timed_out", { timeout: this.TIMEOUT })))
            }

            if (id !== this.currId)
                return log.warn("AutoFetch has been aborted, because another one started")

            const apiUrl = `${baseUrl}/api/validation/report?id=${id}`
            const res: CheckReturnBody | null = await got(apiUrl)
                .then(e => JSON.parse(e.body))
                .catch(() => null)

            if (res?.reported) {
                return resolve(res.entry)
            }

            setTimeout(() => this.authFetch(id, startTime)
                .then(resolve)
                .catch(reject)
                , AuthManager.FetchInterval)
        });
    }

    static async getCookies() {
        const cookies = {} as { [key: string]: string }

        for (const cookieType of availableCookieTypes) {
            const toGetKey = getID(cookieType, "key")
            const toGetValue = getID(cookieType, "value")
            const key = Storage.get(toGetKey) as string
            const value = await Storage.getSecure(toGetValue).catch(() => undefined)
            if (value && key)
                cookies[key] = value
            else {
                log.warn("Could not find value for key", toGetValue, "or", toGetKey, "Probably means that this user is not logged in.")
                return null
            }
        }

        let cookieString = ""
        Object.entries(cookies)
            .forEach(([key, value]) => cookieString += `${key}=${value}; `)
        return cookieString
    }

    static async getSession(): Promise<SessionInfo> {
        const innerSession = async () => {
            const { recordManager } = MainGlobals.obs
            const cookieString = await this.getCookies()

            if (!cookieString) {
                this.offlineMode = false
                return {
                    status: SessionStatus.UNAUTHENTICATED,
                    data: null
                }
            }

            const apiUrl = `${baseUrl}/api/auth/session`
            const response = await got(apiUrl, {
                headers: {
                    cookie: cookieString
                }
            }).then(e => (JSON.parse(e.body) as SessionData))
                .catch(e => {
                    log.error("Could not login starting in offline mode...")
                    console.error("Login error", e)
                    return null
                })

            if (response === null) {
                this.offlineMode = true
                recordManager.enable()
                return {
                    data: null,
                    status: SessionStatus.OFFLINE
                }
            }

            this.offlineMode = false
            if (Object.keys(response).length === 0) {
                log.info("UNAUTHENTICATED: No Keys in Response")
                return {
                    data: undefined,
                    status: SessionStatus.UNAUTHENTICATED
                }
            }

            recordManager.enable()
            log.info("AUTHENTICATED: with session")
            return {
                data: response,
                status: SessionStatus.AUTHENTICATED
            }
        }

        if (this.cachedSession)
            return this.cachedSession

        const res = await innerSession()
        setTimeout(() => this.cachedSession = null, CACHE_INVALIDATE)

        this.cachedSession = res
        return res
    }

    static async signOut() {
        const t = getLocalizedT("backend", "auth.signout")
        const { recordManager } = MainGlobals.obs
        for (const key of availableCookieTypes) {
            const id = getID(key, "key")
            const value = getID(key, "value")

            Storage.delete(id as any)
            await Storage.removeSecure(value)
        }

        const isRecording = recordManager.isRecording()
        recordManager.disable()
        if (isRecording) {
            await recordManager.stopRecording()
            clickableNotification({
                title: t("title"),
                body: t("body"),
                silent: true
            }, () => MainGlobals.window.show()).show()
        }

        this.updateListeners()
    }

    static register() {
        RegManMain.onPromise("auth_authenticate", () => this.authenticate())
        RegManMain.onPromise("auth_get_session", () => this.getSession())
        RegManMain.onPromise("auth_signout", () => this.signOut())
        RegManMain.onPromise("auth_is_offline", async () => this.isOffline())

        if (!this.offlineLoopId)
            this.offlineLoopId = setInterval(() => this.offlineCheck(), OFFLINE_CHECK_INTERVAL)

        this.addOfflineChangeListener(() => RegManMain.send("auth_update"))
    }
}

interface CheckReturnBody {
    reported: boolean,
    entry: ClientSessionInterface[]
}

const availableCookieTypes = ["session", "csrf"]
type CookieType = typeof availableCookieTypes[number]
interface ClientSessionInterface {
    cookie: string,
    key: string,
    type: CookieType
}

function getID(type: CookieType, obj: "key" | "value") {
    return `auth_${type}_` + obj
}