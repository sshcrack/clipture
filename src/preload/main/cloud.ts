import { CloudClipStatus } from '@backend/managers/cloud/interface'
import { RegManRender } from '@general/register/render'

const reg = RegManRender

type ProgressFunc = (update: ReadonlyArray<CloudClipStatus>) => unknown
const progressListener = [] as ProgressFunc[]

reg.on("cloud_update", (_, u) => progressListener.forEach(x => x(u)))
export const cloud = {
    upload: (clipName: string) => reg.emitPromise("cloud_upload", clipName),
    deleteClip: (clipName: string) => reg.emitPromise("cloud_delete", clipName),
    share: (clipName: string) => reg.emitPromise("cloud_share", clipName),
    onUpdate: (listener: ProgressFunc) => {
        progressListener.push(listener)
        return () => {
            const index = progressListener.findIndex(e => e === listener)
            if(index === -1)
                return

            progressListener.splice(index, 1)
        }
    },
    rename: (original: string, clipName: string) => reg.emitPromise("cloud_rename", original, clipName)
}

export default cloud