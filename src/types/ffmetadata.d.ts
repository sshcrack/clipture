declare module "ffmetadata" {
    export type Data = "title" | "author" | "album_artist" | "album" | "grouping" | "composer" | "year" | "track" | "comment" | "genre" | "copyright" | "description" | "synopsis" | "show" | "network" | "lyrics"
    export type DataObj = { [key in Data]?: string }

    export function setFfmpegPath(path: string): void;
    export function read(path: string, callback: (err, data: DataObj) => unknown): void
    export function write(path: string, data: DataObj, callback: (err) => unknown): void

}