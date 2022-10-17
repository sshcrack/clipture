import { CloudClipStatus, CloudUsage } from '@backend/managers/cloud/interface'
import { RegManRender } from '@general/register/render'

const reg = RegManRender

type ProgressFunc = (update: ReadonlyArray<CloudClipStatus>) => unknown
type UsageFunc = (usage: CloudUsage) => unknown

const progressListener = [] as ProgressFunc[]
const usageListener = [] as UsageFunc[]

reg.on("cloud_update", (_, u) => progressListener.forEach(x => x(u)))
reg.on("cloud_usageUpdate", (_, u) => usageListener.forEach(x => x(u)))

export const cloud = {
    upload: (clipName: string) => reg.emitPromise("cloud_upload", clipName),
    deleteClip: (clipName: string) => reg.emitPromise("cloud_delete", clipName),
    share: (clipName: string) => reg.emitPromise("cloud_share", clipName),
    onUpdate: (listener: ProgressFunc) => {
        progressListener.push(listener)
        return () => {
            const index = progressListener.findIndex(e => e === listener)
            if (index === -1)
                return

            progressListener.splice(index, 1)
        }
    },
    rename: (original: string, clipName: string) => reg.emitPromise("cloud_rename", original, clipName),
    usage: () => reg.emitPromise("cloud_usage"),
    addUsageListener: (listener: UsageFunc) => {
        usageListener.push(listener)
        return () => {
            const index = usageListener.findIndex(e => e === listener)
            if (index === -1)
                return

            usageListener.splice(index, 1)
        }
    }
}

export default cloud