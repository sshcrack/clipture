import { RegManRender } from '@register/render';

const reg = RegManRender
const obs = {
    isInitialized: () => reg.emitSync("obs_is_initialized"),
    initialize: () => reg.emitPromise("obs_initialize"),
}

export default obs;