import { existsProm } from '@backend/tools/fs';
import fs from "fs/promises";
import { DetectableGame } from '../obs/Scene/interfaces';


export function getClipInfoPath(recordingPath: string, clipName: string) {
    return recordingPath + "/" + clipName + ".json"
}

export async function getClipInfo(recordingPath: string, clipName: string): Promise<DetectableGame | null> {
    const infoJsonPath = getClipInfoPath(recordingPath, clipName)
    if (!await existsProm(infoJsonPath))
        return null

    const infoJson = await fs.readFile(infoJsonPath, "utf8")
    return JSON.parse(infoJson) as DetectableGame
}
