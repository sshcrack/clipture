import { contextBridge } from 'electron';
import log from "electron-log";

log.transports.file.maxSize = 1024 * 1024 * 20
window.log = log;

export const API = {
}

contextBridge.exposeInMainWorld(
    "api",
    API
)

contextBridge.exposeInMainWorld(
    "log",
    log
)
