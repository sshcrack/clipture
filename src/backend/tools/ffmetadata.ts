import { MainGlobals } from '@Globals/mainGlobals'
import metadata, { DataObj } from "ffmetadata"

metadata.setFfmpegPath(MainGlobals.ffmpegExe)

export function setVideoMetadata(path: string, data: DataObj) {
    return new Promise<void>((resolve, reject) => {
        metadata.write(path, data, (err) => {
            if (err)
                reject(err)
            else
                resolve()
        })
    });
}

export function readVideoMetadata(path: string) {
    return new Promise<DataObj>((resolve, reject) => {
        metadata.read(path, (err, data) => {
            if (err)
                reject(err)
            else
                resolve(data)
        })
    });
}