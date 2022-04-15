import { ipcRenderer, IpcRendererEvent } from 'electron';
import { MainLogger } from 'src/interfaces/mainLogger';
import { getErrorEvent, getSuccessfulEvent } from './tools';
import { MainToRender, RegisterEvents, RegisterEventsPromises } from './type';

const log = MainLogger.get("RegisterManager", "Render");

function hasEventProm(event: string) {
    return ipcRenderer.sendSync("register_get_prom")
        .includes(event)
}

function hasEventSync(event: string) {
    return ipcRenderer.sendSync("register_get_sync")
        .includes(event)
}

export class RegManRender {
    static emitPromise<T extends keyof RegisterEventsPromises, K extends Parameters<RegisterEventsPromises[T]>, X extends ReturnType<RegisterEventsPromises[T]>>(event: T, ...args: K) {
        if(!hasEventProm(event))
            log.error("Promise-Event not registered:", event)

        return new Promise<X>((resolve, reject) => {
            const id = Math.random().toString()
            const sucEvent = getSuccessfulEvent(event)
            const errEvent = getErrorEvent(event)

            ipcRenderer.send(event, id, ...args)
            ipcRenderer.on(sucEvent, (e, innerId, result) => {
                if (innerId !== id)
                    return

                resolve(result as X)
            })

            ipcRenderer.on(errEvent, (e, innerId, err) => {
                if (innerId !== id)
                    return

                reject(err)
            })
        });
    }

    static emitSync<T extends keyof RegisterEvents, K extends Parameters<RegisterEvents[T]>, X extends ReturnType<RegisterEvents[T]>>(event: T, ...args: K) {
        if(!hasEventSync(event))
            log.error("Sync-Event not registered:", event)

        return ipcRenderer.sendSync(event, ...args) as X
    }

    static on<T extends keyof MainToRender, K extends Parameters<MainToRender[T]>, X extends ReturnType<MainToRender[T]>>(event: T, callback: (event: IpcRendererEvent, ...args: K) => X) {
        ipcRenderer.on(event, callback)
    }
}