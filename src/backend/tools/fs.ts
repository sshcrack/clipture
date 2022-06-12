import { MainGlobals } from '@Globals/mainGlobals'
import fs from "fs/promises"
import path from 'path'

export function existsProm(file: string) {
    return fs.stat(file)
        .then(() => true)
        .catch(() => false)
}

export function getClipCachePath() {
    return path.join(MainGlobals.getTempDir(), "clip_cache.json")
}

export function getClipImagePath() {
    return path.join(MainGlobals.getTempDir(), "clip_image.json")
}