import { Progress } from "@backend/processors/events/interface"
import { RegManRender } from "@general/register/render"

type ListenerFunc = (prog: Progress) => unknown

const listeners = [] as ListenerFunc[]

RegManRender.on("prerequisites_update", (_, prog) => listeners.map(e => e(prog)))
const prerequisites = {
    isValid: () => RegManRender.emitPromise("prerequisites_is_valid"),
    initialize: () => RegManRender.emitPromise("prerequisites_initialize"),
    addUpdateListener: (cb: ListenerFunc) => {
        listeners.push(cb)
        return () => {
            const index = listeners.indexOf(cb)
            if(index === -1) {
                console.log("Could not remove listener")
                return
            }

            listeners.splice(index, 1)
        }
    }
}

export default prerequisites