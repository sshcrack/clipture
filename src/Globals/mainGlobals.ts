import { app, BrowserWindow } from 'electron';
import fs from "fs";
import os from "os";
import path from "path";
import Store from "electron-store"

const defaultInstall = app.getPath("userData")
const mainStore = new Store({
    defaults: {
        "install_dir": defaultInstall,
        "install_dir_selected": false
    }
})
export class MainGlobals {
    static window: BrowserWindow
    static store = mainStore


    static getTempDir(shouldDelete = false) {
        const tempPath = path.join(app.getPath("userData"), "temp");

        if (fs.existsSync(tempPath) && shouldDelete)
            fs.rmSync(tempPath, { recursive: true, force: true });


        if (!fs.existsSync(tempPath))
            fs.mkdirSync(tempPath);

        return tempPath;
    }

    static getOS() {
        return os.type() as "Linux" | "Windows_NT" | "Darwin"
    }
}