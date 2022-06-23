import { DetectableGame } from '../obs/Scene/interfaces';

export interface Video {
    video: string,
    videoName: string,
    thumbnail: string,
    info: DetectableGame | null
}

export interface ClipCutInfo {
    videoName: string,
    start: number,
    end: number
}