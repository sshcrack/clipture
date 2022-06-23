import { existsProm } from '@backend/tools/fs';
import fs from "fs/promises";
import { DetectableGame } from '../obs/Scene/interfaces';


export function getVideoInfoPath(recordingPath: string, clipName: string) {
    return recordingPath + "/" + clipName + ".json"
}

export async function getVideoInfo(recordingPath: string, clipName: string): Promise<DetectableGame | null> {
    const infoJsonPath = getVideoInfoPath(recordingPath, clipName)
    if (!await existsProm(infoJsonPath))
        return null

    const infoJson = await fs.readFile(infoJsonPath, "utf8")
    return JSON.parse(infoJson) as DetectableGame
}
