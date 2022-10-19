import { DeleteMethods } from '@backend/managers/storage/interface';
import { getAddRemoveListener } from '@general/tools/listener';
import { RegManRender } from '@register/render';

const reg = RegManRender
type ListenerType = (lockedVideos: string[]) => void
const listeners = [] as ListenerType[]

reg.on("storage_lock", (_, lockedVideos: string[]) => listeners.map(e => e(lockedVideos)))

const storage = {
    setDeleteMode: (method: DeleteMethods[]) => RegManRender.emitPromise("storage_set_delete_mode", method),
    getDeleteMode: () => RegManRender.emitPromise("storage_get_delete_mode"),
    getLockedVideos: () => RegManRender.emitPromise("storage_get_locked"),
    onVideosLocked: (callback: ListenerType) => getAddRemoveListener(callback, listeners)
}

export default storage;