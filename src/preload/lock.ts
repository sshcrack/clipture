import { RegManRender } from '@general/register/render'
import { ipcRenderer } from 'electron'
import { LockedReturnType, ListenerFunc} from '../backend/managers/lock/interface'
import { Progress } from '../backend/processors/events/interface'

const lockListeners: ListenerFunc[] = []

RegManRender.on("lock_update", (_, locked, progress: Progress) => lockListeners.map((func) => func(locked, progress)))
RegManRender.emitSync("lock_add_listener")
const lock = {
    addLockListener: (func: ListenerFunc) => lockListeners.push((a, b) => func(a, b)),
    isLocked: () => RegManRender.emitSync("lock_is_locked"),
    lock: (prog: Progress) => setLock(true, prog),
    unlock: (prog: Progress) => setLock(false, prog),
    update: (prog: Progress) => RegManRender.emitSync("lock_update", prog)
}

function setLock(locked: boolean, prog: Progress) {
    RegManRender.emitSync("lock_set", locked, prog)
}

export default lock