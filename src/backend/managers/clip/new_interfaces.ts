import { CloudGeneralGame, GeneralGame } from '../game/interface'

export type SharedMediaInfo = {
    mediaName: string,
    icoName: string | null,
    size: number,
    modified: number,
    status: MediaStatus
}

export type LocalMediaInfo = SharedMediaInfo & {
    game: GeneralGame | null,
    additional?: CloudOnlyInfo
}

export type CloudOnlyInfo = {
    id: string,
    isPublic: boolean,
    game?: CloudGeneralGame
}

export type CloudMediaInfo = SharedMediaInfo & CloudOnlyInfo

export type GeneralMediaInfo = {
    storageLoc: "local",
    type: "video" | "clip",
    info: LocalMediaInfo
} | {
    storageLoc: "cloud",
    type: "clip",
    info: CloudMediaInfo
}

export enum MediaStatus {
    Uploaded,
    LocalOnly,
    Cutting,
    Video,
    Uploading
}