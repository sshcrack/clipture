import { contextBridge } from 'electron';
import log from "electron-log";
import overlay from "../main/overlay"

log.transports.file.maxSize = 1024 * 1024 * 20
contextBridge.exposeInMainWorld(
    "log",
    log
)


export const API = {
    overlay
}
contextBridge.exposeInMainWorld(
    "api",
    API
)