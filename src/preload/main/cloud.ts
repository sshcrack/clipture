import { CloudClipStatus, CloudUsage } from '@backend/managers/cloud/interface'
import { RegManRender } from '@general/register/render'
import { getAddRemoveListener } from '@general/tools/listener'

const reg = RegManRender

type ProgressFunc = (update: ReadonlyArray<CloudClipStatus>) => unknown
type UsageFunc = (usage: CloudUsage) => unknown

let progressListener = [] as ProgressFunc[]
let usageListener = [] as UsageFunc[]

reg.on("cloud_update", (_, u) => progressListener.forEach(x => x(u)))
reg.on("cloud_usageUpdate", (_, u) => usageListener.forEach(x => x(u)))

export const cloud = {
    upload: (clipName: string) => reg.emitPromise("cloud_upload", clipName),
    deleteClip: (clipName: string) => reg.emitPromise("cloud_delete", clipName),
    share: (clipName: string) => reg.emitPromise("cloud_share", clipName),
    onUpdate: (listener: ProgressFunc) => getAddRemoveListener(listener, progressListener),
    rename: (original: string, clipName: string) => reg.emitPromise("cloud_rename", original, clipName),
    usage: () => reg.emitPromise("cloud_usage"),
    addUsageListener: (listener: UsageFunc) => getAddRemoveListener(listener, usageListener),
    thumbnail: (id: string) => reg.emitPromise("cloud_thumbnail", id)
}

export default cloud