import { contextBridge } from 'electron';
import log from "electron-log";
log.transports.file.maxSize = 1024 * 1024 * 20
import obs from "./obs"

//import lock from "./lock"


export const API = {
    //lock,
    obs
}
contextBridge.exposeInMainWorld(
    "api",
    API
    )

contextBridge.exposeInMainWorld(
    "log",
    log
)