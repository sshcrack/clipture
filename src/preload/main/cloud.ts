import { CloudClipStatus, CloudUsage } from '@backend/managers/cloud/interface'
import { RegManRender } from '@general/register/render'
import { getAddRemoveListener } from '@general/tools/listener'

const reg = RegManRender

type ProgressFunc = (update: ReadonlyArray<CloudClipStatus>) => unknown
type UsageFunc = (usage: CloudUsage) => unknown

const progressListener = [] as ProgressFunc[]
const doneListener = [] as (() => unknown)[]
const usageListener = [] as UsageFunc[]

reg.on("cloud_update", (_, u) => progressListener.forEach(x => x(u)))
reg.on("cloud_done", () => doneListener.forEach(x => x()))
reg.on("cloud_usageUpdate", (_, u) => usageListener.forEach(x => x(u)))

export default {
    upload: (clipName: string, notify = false) => reg.emitPromise("cloud_upload", clipName, notify),
    deleteClip: (clipName: string) => reg.emitPromise("cloud_delete", clipName),
    deleteId: (id: string) => reg.emitPromise("cloud_delete_id", id),
    share: (clipName: string) => reg.emitPromise("cloud_share", clipName),
    shareId: (id: string) => reg.emitPromise("cloud_share_id", id),
    onUpdate: (listener: ProgressFunc) => getAddRemoveListener(listener, progressListener),
    onDone: (listener: () => unknown) => getAddRemoveListener(listener, doneListener),
    rename: (original: string, clipName: string) => reg.emitPromise("cloud_rename", original, clipName),
    usage: () => reg.emitPromise("cloud_usage"),
    addUsageListener: (listener: UsageFunc) => getAddRemoveListener(listener, usageListener),
    thumbnail: (id: string) => reg.emitPromise("cloud_thumbnail", id),
    openId: (id: string) => reg.emitPromise("cloud_open_id", id),
    getId: (id: string) => reg.emitPromise("cloud_discover_get_clip", id),
    discover: {
        list: (offset: number, limit: number, search?: string) => reg.emitPromise("cloud_discover_list", offset, limit, search),
        visibility: (id: string, isPublic: boolean) => reg.emitPromise("cloud_discover_visibility", id, isPublic),
        user: {
            get: (cuid: string) => reg.emitPromise("cloud_discover_get_user", cuid)
        },
        like: {
            has: (id: string) => reg.emitPromise("cloud_discover_is_liked", id),
            set: (id: string, liked: boolean) => reg.emitPromise("cloud_discover_set_liked", id, liked)
        }
    }
}