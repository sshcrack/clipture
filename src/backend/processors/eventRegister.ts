import { ipcMain } from 'electron';
import { LockManager } from '../managers/lock';

export function registerProcessorEvents() {
    ipcMain.on("downloadOBS", e => {
        const inst = LockManager.instance

        inst.lock({
            percent: 0,
            status: "Retrieving OBS installation..."
        })
    })
}
