import { MainGlobals } from '@Globals/mainGlobals'
import fs from "fs/promises"
import path from 'path'

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