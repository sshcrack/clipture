import type { ClientBoundRecReturn } from '@backend/managers/obs/types';
import { RegManRender } from '@register/render';
import type { GameOptions }from "@backend/managers/obs/Scene"

const reg = RegManRender
const obs = {
    isInitialized: () => reg.emitSync("obs_is_initialized"),
    initialize: () => reg.emitPromise("obs_initialize"),
    preview_init: (rect: ClientBoundRecReturn) => reg.emitPromise("obs_preview_init", rect),
    available_monitors: () => reg.emitPromise("obs_available_monitors"),
    available_windows: (game: boolean) => reg.emitPromise("obs_available_windows", game),
    switch_desktop: (monitor: number) => reg.emitPromise("obs_switch_desktop", monitor),
    switch_game: (options: GameOptions) => reg.emitPromise("obs_switch_game", options),
    resize_preview: (react: ClientBoundRecReturn) => reg.emitPromise("obs_resize_preview", react),
}

export default obs;