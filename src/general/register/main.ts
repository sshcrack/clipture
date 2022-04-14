if (!process)
    throw new Error("Register Manager main can not be used in renderer.")


import { ipcMain, IpcMainEvent } from 'electron'
import { MainLogger } from 'src/interfaces/mainLogger'
import { getErrorEvent, getSuccessfulEvent, registerEventProm, registerEventSync } from './tools'
import { RegisterEvents, RegisterEventsPromises } from "./type"

const log = MainLogger.get("RegisterManager", "Main")
export class RegManMain {
    static onSync<T extends keyof RegisterEvents, K extends Parameters<RegisterEvents[T]>, X extends ReturnType<RegisterEvents[T]>>(event: T, callback: (event: IpcMainEvent, ...args: K) => X) {
        log.debug("Registering sync event:", event)

        registerEventSync(event)
        return ipcMain.on(event, (e, ...args) => {

            const returnType = callback(e, ...args as any);

            e.returnValue = returnType
        })
    }

    static onPromise<T extends keyof RegisterEventsPromises, K extends Parameters<RegisterEventsPromises[T]>, X extends ReturnType<RegisterEventsPromises[T]>>(event: T, callback: (event: IpcMainEvent, ...args: K) => Promise<X>) {
        log.debug("Registering promise event:", event)
        const errEv = getErrorEvent(event)
        const sucEvent = getSuccessfulEvent(event)

        registerEventProm(event)
        return ipcMain.on(event, async (e, id: string, ...args) =>
            callback(e, ...args as any)
                .then(arg => e.reply(sucEvent, id, arg))
                .catch(err => e.reply(errEv, id, err))
        )
    }

    static emit<T extends keyof RegisterEvents, K extends Parameters<RegisterEvents[T]>>(event: T, ...args: K) {
        return ipcMain.emit(event, ...args)
    }
}