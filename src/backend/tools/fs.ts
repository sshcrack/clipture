import { MainGlobals } from '@Globals/mainGlobals'
import fs from "fs/promises"
import path from 'path'
import { app } from "electron"

export function existsProm(file: string) {
    return fs.stat(file)
        .then(() => true)
        .catch(() => false)
}

export function getVideoInfoCachePath() {
    return path.join(MainGlobals.getTempDir(), "video_info_cache.json")
}


export function getClipInfoCachePath() {
    return path.join(MainGlobals.getTempDir(), "clip_info_cache.json")
}

export function getSharedImageCachePath() {
    return path.join(MainGlobals.getTempDir(), "clip_image.json")
}

export function getWebpackDir() {
    const packaged = app.isPackaged
    const appDir = app.getAppPath()

    if(packaged)
        return path.join(appDir, ".webpack", "main")

    // only for dev
    return path.join(process.cwd(), ".webpack", "main")
}