import { OBSManager } from '@backend/managers/obs';
import { app, BrowserWindow } from 'electron';
import fs from "fs";
import os from "os";
import path from "path";
import { mainStore } from './storage';


export class MainGlobals {
    static window: BrowserWindow
    static store = mainStore
    static obs: OBSManager;


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