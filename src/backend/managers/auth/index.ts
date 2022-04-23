import { RegManMain } from '@general/register/main';
import { Globals } from '@Globals';
import { Storage } from '@Globals/storage';
import { BrowserWindow, shell } from 'electron';
import got from "got";
import { MainLogger } from 'src/interfaces/mainLogger';
import { v4 as uuid } from "uuid";
import { SessionData, SessionStatus } from './interfaces';


const log = MainLogger.get("Backend", "Managers", "AuthManager")
const baseUrl = Globals.baseUrl;

export class AuthManager {
    private static window: BrowserWindow
    public static readonly TIMEOUT = 1000 * 60 * 10// 10 Minutes
    public static readonly FetchInterval = 100
    private static currId = null as string

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
            await Storage.setSecure(getID(type, "value"), cookie)
        }

        this.updateListeners()
        return id
    }

    private static updateListeners() {
        RegManMain.send("auth_update")
    }

    private static authFetch(id: string, startTime: number) {
        return new Promise<ClientSessionInterface[]>(async (resolve, reject) => {
            if (Date.now() - startTime > this.TIMEOUT) {
                log.info("Timeout has  been exceeded", Date.now() - startTime)
                return reject(new Error("Timeout of " + this.TIMEOUT + "ms exceeded"))
            }

            if (id !== this.currId) {
                log.warn("AutoFetch has been aborted, because another one started")
                return reject(new Error("AutoFetch has been aborted, because another one started"))
            }

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

    static async getSession(): Promise<GetSessionReturn> {
        log.debug("Getting session...")
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
                return {
                    status: SessionStatus.UNAUTHENTICATED,
                    data: null
                }
            }
        }

        let cookieString = ""
        Object.entries(cookies)
            .forEach(([key, value]) => cookieString += `${key}=${value}; `)

        const apiUrl = `${baseUrl}/api/auth/session`
        const response = await got(apiUrl, {
            headers: {
                cookie: cookieString
            }
        }).then(e => JSON.parse(e.body) as SessionData)

        if (Object.keys(response).length === 0)
            return {
                data: undefined,
                status: SessionStatus.UNAUTHENTICATED
            }

        return {
            data: response,
            status: SessionStatus.AUTHENTICATED
        }
    }

    static async signOut() {
        for (const key in availableCookieTypes) {
            const id = getID(key, "key")
            const value = getID(key, "value")

            Storage.delete(id as any)
            await Storage.removeSecure(value)
        }
        this.updateListeners()
    }

    static register() {
        RegManMain.onPromise("auth_authenticate", () => this.authenticate())
        RegManMain.onPromise("auth_get_session", () => this.getSession())
        RegManMain.onPromise("auth_signout", () => this.signOut())
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

type GetSessionReturn = {
    data: SessionData,
    status: SessionStatus
}

function getID(type: CookieType, obj: "key" | "value") {
    return `auth_${type}_` + obj
}