import { Progress } from '@backend/processors/events/interface';
import { GeneralGame } from '../game/interface';


export type Video = {
    modified: number,
    video: string,
    videoName: string,
    game: GeneralGame | null,
    bookmarks: number[] | null,
    icoName: string | null,
    displayName: string
}

export type Clip = {
    modified: number,
    game: GeneralGame | null,
    clipName: string,
    original: string,
    icoName: string | null,
    uploaded: boolean,
    tooLarge: boolean,
    cloudOnly: boolean,
    cloudId: string
}

export type ClipRaw = Omit<Clip, "game" | "icoName" | "uploaded" | "cloudOnly" | "tooLarge" | "clipName" | "cloudId"> & {
    gameId: string
    hex: string,
    originalInfo: VideoInfo
}

export interface ClipCutInfo {
    clipName: string,
    videoName: string,
    start: number,
    end: number
}

export interface VideoInfo {
    gameId: string,
    bookmarks: number[],
    displayName?: string | null
}

export interface ClipProcessingInfo {
    progress: Progress,
    info: ClipCutInfo & { clipPath: string }
}