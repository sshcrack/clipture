import { ipcRenderer } from 'electron';
import { RegisterEvents, RegisterEventsPromises } from './type';
import { getErrorEvent, getSuccessfulEvent, hasEventProm, hasEventSync } from './tools';
import { MainLogger } from 'src/interfaces/mainLogger';


const log = MainLogger.get("RegisterManager", "Render");
export class RegManRender {
    static emitPromise<T extends keyof RegisterEventsPromises, K extends Parameters<RegisterEventsPromises[T]>, X extends ReturnType<RegisterEventsPromises[T]>>(event: T, ...args: K) {
        if(!hasEventProm(event))
            log.error("Promise-Event not registered:", event)

        return new Promise<X>((resolve, reject) => {
            const id = Math.random().toString()
            const sucEvent = getSuccessfulEvent(event)
            const errEvent = getErrorEvent(event)

            ipcRenderer.send(event, id, ...args)
            ipcRenderer.on(sucEvent, (e, innerId, ...args) => {
                if (innerId !== id)
                    return

                resolve(args as X)
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
}