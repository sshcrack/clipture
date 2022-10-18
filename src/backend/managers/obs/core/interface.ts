import { VideoInfo } from '@backend/managers/clip/interface'
import { GeneralGame } from '@backend/managers/game/interface'

export type CurrentType = Omit<VideoInfo, "duration"> & {
    videoPath: string | null,
    currentInfoPath: string | null
}

export type OutCurrentType = Omit<CurrentType, "gameId"> & {
    game: GeneralGame,
    videoName: string | null
}

export type CaptureMethod = "desktop" | "window"

export type RecordingListenerInfo = { gameId: string, bookmarks: number[] }