import { RegManRender } from '@register/render';

const reg = RegManRender
const obs = {
    isInitialized: () => reg.emitSync("obs_is_initialized"),
    initialize: () => reg.emitPromise("obs_initialize"),
    available_windows: () => reg.emitPromise("obs_available_windows")
}

export default obs;