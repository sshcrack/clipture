
const ffmpegExe = __dirname + "/assets/ffmpeg.exe";
const ffprobeExe = __dirname + "/assets/ffprobe.exe";

process.env.FFMPEG_PATH = ffmpegExe
process.env.FFPROBE_PATH = ffprobeExe


import { OBSManager } from '@backend/managers/obs';
import { app, BrowserWindow, nativeImage } from 'electron';
import fs from "fs";
import os from "os";
import path from "path";


function isDev() {
    return process.argv[2] === "dev"
}

let isDevCached = isDev()
export class MainGlobals {
    static window: BrowserWindow
    static baseUrl = isDevCached ? "http://localhost:3001" : "https://clipture.sshcrack.me"
    static gameUrl = this.baseUrl + "/api/game/detection"

    static readonly nativeMngExe = __dirname + "/assets/native_mng.exe"
    static readonly ffmpegExe = ffmpegExe
    static readonly ffprobeExe = ffprobeExe
    static readonly iconFile = __dirname + "./assets/logo.ico";
    static readonly dotIconFile = __dirname + "./assets/dot.ico";
    static readonly dotIconNativeImage = nativeImage.createFromPath(this.dotIconFile)
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
