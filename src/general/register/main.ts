if (!process)
    throw new Error("Register Manager main can not be used in renderer.")


import { ipcMain, IpcMainEvent, WebContents } from 'electron'
import { MainLogger } from 'src/interfaces/mainLogger'
import { getErrorEvent, getSuccessfulEvent } from './tools'
import { MainToRender, RegisterEvents, RegisterEventsPromises } from "./type"

const log = MainLogger.get("RegisterManager", "Main")

export class RegManMain {
    static eventSync = [] as string[]
    static eventProm = [] as string[]

    static onSync<T extends keyof RegisterEvents, K extends Parameters<RegisterEvents[T]>, X extends ReturnType<RegisterEvents[T]>>(event: T, callback: (event: IpcMainEvent, ...args: K) => X) {
        log.debug("Registering sync event:", event)

        if (!this.eventSync.includes(event))
            this.eventSync.push(event)

        return ipcMain.on(event, (e, ...args) => {

            const returnType = callback(e, ...args as any);

            e.returnValue = returnType
        })
    }

    static onPromise<T extends keyof RegisterEventsPromises, K extends Parameters<RegisterEventsPromises[T]>, X extends ReturnType<RegisterEventsPromises[T]>>(event: T, callback: (event: IpcMainEvent, ...args: K) => Promise<X>) {
        log.debug("Registering promise event:", event)
        const errEv = getErrorEvent(event)
        const sucEvent = getSuccessfulEvent(event)


        if (!this.eventProm.includes(event))
            this.eventProm.push(event)

        return ipcMain.on(event, async (e, id: string, ...args) =>
            callback(e, ...args as any)
                .then(arg => e.reply(sucEvent, id, arg))
                .catch(err => e.reply(errEv, id, err))
        )
    }

    static emit<T extends keyof RegisterEvents, K extends Parameters<RegisterEvents[T]>>(event: T, ...args: K) {
        return ipcMain.emit(event, ...args)
    }

    static send<T extends keyof MainToRender, K extends Parameters<MainToRender[T]>>(sender: WebContents, event: T, ...args: K) {
        log.warn("Send: Event not registered:", event)
        return sender.send(event, ...args)
    }

    static register() {
        ipcMain.on("register_get_sync", e => e.returnValue = RegManMain.eventSync)
        ipcMain.on("register_get_prom", e => e.returnValue = RegManMain.eventProm)
    }
}