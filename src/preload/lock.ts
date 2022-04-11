import { ipcRenderer } from 'electron'
import { LockedReturnType, ListenerFunc} from '../backend/managers/lock/interface'
import { Progress } from '../backend/processors/events/interface'

const lockListeners: ListenerFunc[] = []

ipcRenderer.on("lock_update", (_, locked, progress: Progress) => lockListeners.map((func) => func(locked, progress)))

ipcRenderer.send("add_lock_listener")

export const lock = {
    addLockListener: (func: ListenerFunc) => lockListeners.push((a, b) => func(a, b)),
    isLocked: () => ipcRenderer.sendSync("is_locked") as LockedReturnType,
    lock: (prog: Progress) => setLock(true, prog),
    unlock: (prog: Progress) => setLock(false, prog),
    update: (prog: Progress) => ipcRenderer.send("update_lock", prog)
}

function setLock(locked: boolean, prog: Progress) {
    ipcRenderer.sendSync("set_lock", locked, prog)
}
