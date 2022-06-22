import { DetectableGame } from '../obs/Scene/interfaces';

export interface Clip {
    clip: string,
    clipName: string,
    thumbnail: string,
    info: DetectableGame | null
}

export interface ClipCutInfo {
    clipName: string,
    start: number,
    end: number
}