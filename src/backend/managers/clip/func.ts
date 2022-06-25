import { existsProm } from '@backend/tools/fs';
import fs from "fs/promises";
import { DetectableGame } from '../obs/Scene/interfaces';
import { Clip, VideoInfo } from './interface';


export function getVideoInfoPath(recordingPath: string, videoName: string) {
    return recordingPath + "/" + videoName + ".json"
}

export async function getVideoInfo(recordingPath: string, videoName: string): Promise<VideoInfo | null> {
    const infoJsonPath = getVideoInfoPath(recordingPath, videoName)
    if (!await existsProm(infoJsonPath))
        return null

    const infoJson = await fs.readFile(infoJsonPath, "utf8")
    return JSON.parse(infoJson) as VideoInfo
}


export function getClipInfoPath(recordingPath: string, clipName: string) {
    return recordingPath + "/" + clipName + ".json"
}

export async function getClipInfo(recordingPath: string, clipName: string): Promise<Clip | null> {
    const infoJsonPath = getVideoInfoPath(recordingPath, clipName)
    if (!await existsProm(infoJsonPath))
        return null

    const infoJson = await fs.readFile(infoJsonPath, "utf8")
    return JSON.parse(infoJson) as Clip
}
