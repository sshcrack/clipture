import { RegManRender } from '@general/register/render';

const listeners = [] as (() => unknown)[]
const auth = {
    signIn: () => RegManRender.emitPromise("auth_authenticate"),
    signOut: () => RegManRender.emitSync("auth_signout"),
    getSession: () => RegManRender.emitPromise("auth_get_session"),
    subscribeToUpdates: (callback: () => unknown) => listeners.push(callback)
}

RegManRender.on("auth_update", () => listeners.map(e => e()))
export default auth;