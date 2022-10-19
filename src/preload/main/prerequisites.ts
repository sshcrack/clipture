import { Progress } from "@backend/processors/events/interface"
import { RegManRender } from "@general/register/render"
import { getAddRemoveListener } from '@general/tools/listener'

type ListenerFunc = (prog: Progress) => unknown

let listeners = [] as ListenerFunc[]

RegManRender.on("prerequisites_update", (_, prog) => listeners.map(e => e(prog)))
const prerequisites = {
    isValid: () => RegManRender.emitPromise("prerequisites_is_valid"),
    initialize: () => RegManRender.emitPromise("prerequisites_initialize"),
    addUpdateListener: (cb: ListenerFunc) => getAddRemoveListener(cb, listeners)
}

export default prerequisites