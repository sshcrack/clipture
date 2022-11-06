import { contextBridge } from 'electron';
import log from "electron-log";

log.transports.file.maxSize = 1024 * 1024 * 20
contextBridge.exposeInMainWorld(
    "log",
    log
)