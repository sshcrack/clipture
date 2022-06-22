import { UseToastOptions } from '@chakra-ui/react';
import { RegManRender } from '@general/register/render';
import { contextBridge, ipcRenderer } from 'electron';
import log from "electron-log";
import auth from "./auth";
import clips from "./clips";
import lock from "./lock";
import obs from "./obs";
import process from "./process";
import titlebar from "./titlebar";



log.transports.file.maxSize = 1024 * 1024 * 20
type ToastHandlerFunc = (info: UseToastOptions) => void
const toastHandlers = [] as ToastHandlerFunc[]
RegManRender.on("toast_show", (_, options) => toastHandlers.map(e => e(options)))

export const API = {
    clips,
    lock,
    obs,
    auth,
    process,
    titlebar,
    shutdown: () => ipcRenderer.send("quit-app"),
    onToast: (handler: ToastHandlerFunc) => toastHandlers.push(e => handler(e)),
    isDev: () => ipcRenderer.sendSync("isDev") as boolean
}
contextBridge.exposeInMainWorld(
    "api",
    API
    )

contextBridge.exposeInMainWorld(
    "log",
    log
)