import { Progress } from '@backend/processors/events/interface';
import { DetectableGame } from '../obs/Scene/interfaces';

export interface Video {
    modified: number,
    video: string,
    videoName: string,
    info: DetectableGame | null
}

export type Clip = {
    modified: number,
    clipName: string,
    game: DetectableGame,
    original: string,
    start: number,
    end: number,
    duration: number
}

export interface ClipCutInfo {
    clipName: string,
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