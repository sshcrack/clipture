import { Progress } from '@backend/processors/events/interface';
import { GeneralGame } from '../game/interface';


export type Video = {
    modified: number,
    video: string,
    videoName: string,
    game: GeneralGame | null,
    bookmarks: number[] | null,
    icoName: string | null
}

export type Clip = {
    modified: number,
    game: GeneralGame | null,
    clipName: string,
    original: string,
    start: number,
    end: number,
    duration: number,
    icoName: string | null,
    uploaded: boolean
}

export type ClipRaw = Omit<Clip, "game" | "icoName" | "uploaded"> & {
    gameId: string
    hex: string
}

export interface ClipCutInfo {
    clipName: string,
    videoName: string,
    start: number,
    end: number
}

export interface VideoInfo {
    gameId: string,
    bookmarks: number[]
}

export interface ClipProcessingInfo {
    progress: Progress,
    info: ClipCutInfo & { clipPath: string }
}