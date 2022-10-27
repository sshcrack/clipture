if (!process)
    throw new Error("Register Manager main can not be used in renderer.")


import { BrowserWindow, ipcMain, IpcMainEvent, IpcMainInvokeEvent } from 'electron'
import { MainLogger } from 'src/interfaces/mainLogger'
import { MainToRender, RegisterEvents, RegisterEventsPromises } from "./type/index"

const log = MainLogger.get("RegisterManager", "Main")


export class RegManMain {
    static eventSync = [] as string[]
    static eventProm = [] as string[]

    static onSync<T extends keyof RegisterEvents, K extends Parameters<RegisterEvents[T]>, X extends ReturnType<RegisterEvents[T]>>(event: T, callback: (event: IpcMainEvent, ...args: K) => X) {
        if (!this.eventSync.includes(event))
            this.eventSync.push(event)

        return ipcMain.on(event, (e, ...args) => {

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const returnType = callback(e, ...args as any);

            e.returnValue = returnType
        })
    }

    static onPromise<T extends keyof RegisterEventsPromises, K extends Parameters<RegisterEventsPromises[T]>, X extends ReturnType<RegisterEventsPromises[T]>>(event: T, callback: (event: IpcMainInvokeEvent, ...args: K) => Promise<X>) {
        const registered = this.eventProm.includes(event)
        if (registered) {
            log.error(new Error(`Tried to register event '${event}' more than once. `))
            return
        }

        this.eventProm.push(event)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return ipcMain.handle(event, (e, ...args) => callback(e, ...args as any)
        )
    }

    static emit<T extends keyof RegisterEvents, K extends Parameters<RegisterEvents[T]>>(event: T, ...args: K) {
        return ipcMain.emit(event, ...args)
    }

    static send<T extends keyof MainToRender, K extends Parameters<MainToRender[T]>>(event: T, ...args: K) {
        return BrowserWindow.getAllWindows().map(e => e.webContents.send(event, ...args))
    }

    static register() {
        ipcMain.on("register_get_sync", e => e.returnValue = RegManMain.eventSync)
        ipcMain.on("register_get_prom", e => e.returnValue = RegManMain.eventProm)
    }
}