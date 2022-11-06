import { UseToastOptions } from '@chakra-ui/react';
import { RegManRender } from '@general/register/render';
import { contextBridge, ipcRenderer } from 'electron';
import log from "electron-log";

import auth from "./auth";
import bookmark from "./bookmark";
import clips from "./clips";
import lock from "./lock";
import cloud from "./cloud";
import obs from "./obs";
import game from "./game";
import audio from "./audio";
import storage from "./storage";
import system from './system';
import titlebar from "./titlebar";
import settings from './settings';
import videos from './videos';
import discord from "./discord"
import prerequisites from './prerequisites';
import overlay from './overlay';



log.transports.file.maxSize = 1024 * 1024 * 20
type ToastHandlerFunc = (info: UseToastOptions) => void
const toastHandlers = [] as ToastHandlerFunc[]
RegManRender.on("toast_show", (_, options) => toastHandlers.map(e => e(options)))

export const API = {
    clips,
    videos,
    lock,
    obs,
    auth,
    game,
    titlebar,
    audio,
    system,
    settings,
    bookmark,
    storage,
    prerequisites,
    discord,
    cloud,
    overlay,
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