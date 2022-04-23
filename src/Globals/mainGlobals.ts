import { OBSManager } from '@backend/managers/obs';
import { app, BrowserWindow } from 'electron';
import fs from "fs";
import os from "os";
import path from "path";


export class MainGlobals {
    static window: BrowserWindow
    static readonly nativeMngExe = __dirname + "/assets/native_mng.exe"
    static readonly iconFile = __dirname + "./assets/logo.ico";
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