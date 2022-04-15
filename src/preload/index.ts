import { contextBridge } from 'electron';
import log from "electron-log";
import lock from "./lock";
import auth from "./auth";
import obs from "./obs";



log.transports.file.maxSize = 1024 * 1024 * 20
export const API = {
    lock,
    obs,
    auth
}
contextBridge.exposeInMainWorld(
    "api",
    API
    )

contextBridge.exposeInMainWorld(
    "log",
    log
)