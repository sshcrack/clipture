import { RegManMain } from '@general/register/main'
import { MainGlobals } from '@Globals/mainGlobals'
import { Storage } from '@Globals/storage'
import { readFile } from 'fs/promises'
import glob from "glob"
import path from "path"
import { MainLogger } from 'src/interfaces/mainLogger'
import { generateThumbnail } from "thumbsupply"
import { promisify } from "util"
import { Clip } from './interface'

const globProm = promisify(glob)
const log = MainLogger.get("Backend", "Managers", "Clips")
export class ClipManager {
    private static imageData = new Map<string, string>()
    static async list() {
        const clipPath = Storage.get("clip_path")
        const globPattern = `${clipPath}/**/*.mkv`
        const files = (await globProm(globPattern))
            .map(e => path.resolve(e))

        return await Promise.all(
            files.map(async file => {
                const thumbnailFile = (await generateThumbnail(file, {
                    cacheDir: MainGlobals.getTempDir()
                })
                    .catch(e => {
                        log.error("Failed to generate thumbnail for", file, e)
                        return undefined as string
                    }))

                const thumbnail = 
                    this.imageData.get(thumbnailFile) ??
                    await readFile(thumbnailFile, "base64")

                if (!this.imageData.has(thumbnailFile))
                    this.imageData.set(thumbnailFile, thumbnail)

                return {
                    clip: file,
                    thumbnail: "data:image/png;base64," + thumbnail
                }
            }
            )
        )
            .catch(e => {
                log.error(e)
                throw e
            }) as Clip[]
    }

    static register() {
        RegManMain.onPromise("clips_list", () => this.list())

    }
}