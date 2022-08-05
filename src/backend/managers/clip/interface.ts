import { Progress } from '@backend/processors/events/interface';
import { GeneralGame } from '../game/interface';
import { DetectableGame } from '../obs/Scene/interfaces';


export type Video = {
    modified: number,
    video: string,
    videoName: string,
    game: GeneralGame | null
}

export type Clip = {
    modified: number,
    clipName: string,
    game: GeneralGame | null,
    original: string,
    start: number,
    end: number,
    duration: number
}

export type ClipRaw = Omit<Clip, "game"> & {
    gameId: string
}

export interface ClipCutInfo {
    clipName: string,
    videoName: string,
    start: number,
    end: number
}

export interface VideoInfo {
    gameId: string,
    duration: number | null
}

export interface ClipProcessingInfo {
    progress: Progress,
    info: ClipCutInfo & { clipPath: string }
}