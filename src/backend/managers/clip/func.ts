import { existsProm } from '@backend/tools/fs';
import fs from "fs/promises";
import path from 'path';
import { ClipRaw, VideoInfo } from './interface';


export function getVideoInfoPath(recordingPath: string, videoName: string) {
    return recordingPath + "/" + videoName + ".json"
}

export async function getVideoInfo(recordingPath: string, videoName: string): Promise<VideoInfo | null> {
    const infoJsonPath = getVideoInfoPath(recordingPath, videoName)
    if (!await existsProm(infoJsonPath))
        return null

    const infoJson = await fs.readFile(infoJsonPath, "utf8")
    try {
        return JSON.parse(infoJson) as VideoInfo
    } catch(e) {
        return null
    }
}


export async function getClipInfo(recordingPath: string, clipName: string): Promise<ClipRaw | null> {
    const infoJsonPath = getVideoInfoPath(recordingPath, clipName)
    if (!await existsProm(infoJsonPath))
        return null

    const infoJson = await fs.readFile(infoJsonPath, "utf8")
    return JSON.parse(infoJson) as ClipRaw
}

export function getClipVideoPath(root: string, name: string) {
    return path.join(root, name + ".clipped.mp4")
}

export function getClipVideoProcessingPath(root: string, name: string) {
    return path.join(root, name + ".processing.mp4")
}

export function getClipInfoPath(root: string, name: string) {
    return getClipVideoPath(root, name) + ".json"
}

export function getVideoPath(root: string, name: string) {
    return path.join(root, name + ".mkv")
}

export function getVideoIco(root: string, name: string) {
    return path.join(root, name + ".ico")
}