import { WebContents, BrowserWindow } from "electron"

export function webContentsToWindow(webContents: WebContents) {
    return BrowserWindow.getAllWindows().find(e => e.webContents.id === webContents.id)
}