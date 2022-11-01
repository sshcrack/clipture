import path from "path";
import fs from "fs"
import { getWebpackDir } from "@backend/tools/fs";
import { app, BrowserWindow, nativeImage } from 'electron';

const wDir = getWebpackDir()
const appPath = app.getAppPath();
const packaged = app.isPackaged || !process.argv.includes("dev")

const _cliptureDir = path.join( app.getPath("appData"), "clipture")
let assetsDir = path.join(_cliptureDir, "assets")

if(app.isPackaged) {
    if(!fs.existsSync(assetsDir))
        assetsDir = path.join(appPath, "assets")

} else
    assetsDir = path.join(process.cwd(), "devAssets")



if(!fs.existsSync(assetsDir))
    fs.mkdirSync(assetsDir, { recursive: true })

const ffmpegExe = packaged ? path.join(assetsDir, "ffmpeg.exe") : path.join(process.cwd(), "devAssets", "ffmpeg.exe");
const ffprobeExe = packaged ? path.join(assetsDir, "ffprobe.exe") : path.join(process.cwd(), "devAssets", "ffprobe.exe");

process.env.FFMPEG_PATH = ffmpegExe
process.env.FFPROBE_PATH = ffprobeExe

import { OBSManager } from '@backend/managers/obs';
import os from "os";
import { MainLogger } from 'src/interfaces/mainLogger';


function isDev() {
    return process.argv[2] === "dev"
}

const log = MainLogger.get("Globals", "MainGlobals")
log.silly("Using assetDir", assetsDir)
const isDevCached = isDev()
export class MainGlobals {
    static isPackaged = packaged
    static window: BrowserWindow
    static baseUrl = isDevCached ? "http://localhost:3001" : "https://clipture.sshcrack.me"
    static gameUrl = this.baseUrl + "/api/game/detection"
    static dcClientId = "964216174135103528"

    static readonly nativeMngExe = path.join(wDir, "assets/native_mng.exe")
    static readonly ffmpegExe = ffmpegExe
    static readonly ffprobeExe = ffprobeExe
    static readonly obsRequirePath = packaged ? path.join(assetsDir, "obs-studio-node") : "@streamlabs/obs-studio-node";

    static readonly iconFile = path.join(wDir,"assets/logo.ico");
    static readonly bookmarkedSound = path.join(wDir,"assets/bookmarked.mp3");
    static readonly dotIconFile = path.join(wDir, "assets/dot.ico");
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
