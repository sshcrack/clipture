import { VideoInfo } from '@backend/managers/clip/interface'
import { GeneralGame } from '@backend/managers/game/interface'

export type CurrentType = Omit<VideoInfo, "duration"> & {
    videoPath: string | null,
    currentInfoPath: string | null,
}

export type OutCurrentType = Omit<CurrentType, "gameId"> & {
    game: GeneralGame
}

export type CaptureMethod = "desktop" | "window"