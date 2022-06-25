import { Progress } from '@backend/processors/events/interface';
import { DetectableGame } from '../obs/Scene/interfaces';

export interface Video {
    video: string,
    videoName: string,
    thumbnail: string,
    info: DetectableGame | null
}

export type Clip = {
    clipName: string,
    clipPath: string,
    game: DetectableGame,
    original: string,
    start: number,
    end: number,
    duration: number
}

export type ExtendedClip = Clip & {
    thumbnail: string
}

export interface ClipCutInfo {
    videoName: string,
    start: number,
    end: number
}

export interface VideoInfo {
    game: DetectableGame | null,
    duration: number | null
}

export interface ClipProcessingInfo {
    progress: Progress,
    info: ClipCutInfo & { clipPath: string }
}