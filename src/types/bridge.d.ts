import { API } from '../preload';
import log from "electron-log"
import { regEveProm, regEveSync, mainToRenderer } from "@register/tools"



declare global {
    interface Window {
        api: typeof API
        log: typeof log,
        eventInfo: {
            regEveSync: string[],
            regEveProm: string[],
            mainToRenderer: string[]
        }
    }
}