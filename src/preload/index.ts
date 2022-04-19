import { contextBridge, ipcRenderer } from 'electron';
import log from "electron-log";
import lock from "./lock";
import auth from "./auth";
import obs from "./obs";
import titlebar from "./titlebar";



log.transports.file.maxSize = 1024 * 1024 * 20
export const API = {
    lock,
    obs,
    auth,
    titlebar,
    shutdown: () => ipcRenderer.send("quit-app")
}
contextBridge.exposeInMainWorld(
    "api",
    API
    )

contextBridge.exposeInMainWorld(
    "log",
    log
)