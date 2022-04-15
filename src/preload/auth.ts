import { RegManRender } from '@general/register/render';

const listeners = [] as (() => unknown)[]
const auth = {
    open: () => RegManRender.emitPromise("auth_authenticate"),
    getSession: () => RegManRender.emitPromise("auth_get_session"),
    subscribeToUpdates: (callback: () => unknown) => listeners.push(callback)
}

RegManRender.on("lock_update", () => listeners.map(e => e()))

export default auth;