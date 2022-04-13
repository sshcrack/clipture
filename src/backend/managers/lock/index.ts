import { ipcMain, WebContents } from 'electron';
import { MainLogger } from '../../../interfaces/mainLogger';
import { Progress } from '../../processors/events/interface';
import { LockedReturnType } from './interface';

const logger = MainLogger.get("Managers", "LockManager")
export class LockManager {
    static readonly instance = new LockManager();
    private locked = false;
    private listeners = [] as WebContents[];
    private currProgress = undefined as Progress
    private lockListeners = [] as (() => unknown)[]


    private setLock(lock: boolean, prog: Progress): boolean {
        if(this.locked === lock)
            return false

        if(lock)
            logger.log(`Acquiring, description: ${prog.status}`)
        else
            logger.log(`Releasing, description: ${prog.status}`)

        this.locked === lock;
        if(!lock) {
            this.lockListeners.map(e => e())
            this.lockListeners = [];
        }

        return true
    }

    public lock(prog: Progress): boolean {
        return this.setLock(true, prog)
    }

    public unlock(prog: Progress): boolean {
        return this.setLock(false, prog)
    }

    public isLocked() {
        return this.locked
    }

    public updateListeners(prog: Progress) {
        this.currProgress = prog
        this.listeners.map(e => e.send("lock_update", this.locked, this.currProgress))
    }

    public waitTillReleased() {
        return new Promise<void>(resolve => {
            if(!this.isLocked())
                return resolve()

            this.lockListeners.push(() => resolve())
        });
    }

    public register() {
        ipcMain.on("set_lock", (e, lock: boolean, prog: Progress) => {
            logger.log("Setting lock...")

            if (this.locked === lock)
                return e.returnValue = true

            if (lock)
                this.lock(prog)
            else
                this.unlock(prog)

            e.returnValue = true
        })

        ipcMain.on("update_lock", (e, prog: Progress) => {
            this.updateListeners(prog)
            e.returnValue = true
        })

        ipcMain.on("add_lock_listener", e => this.listeners.push(e.sender))
        ipcMain.on("is_locked", e => e.returnValue = {
            locked: this.isLocked(),
            progress: this.currProgress
        } as LockedReturnType)
    }
}