import { WindowOptions } from '@backend/managers/obs/Scene/interfaces';
import type { ClientBoundRecReturn } from '@backend/managers/obs/types';
import { RegManRender } from '@register/render';

const reg = RegManRender
type ListenerType = (recording: boolean) => void
const listeners = [] as ListenerType[]

reg.on("obs_record_change", (_, recording: boolean) => listeners.map(e => e(recording)))

const obs = {
    isInitialized: () => reg.emitSync("obs_is_initialized"),
    initialize: () => reg.emitPromise("obs_initialize"),

    preview_init: (rect: ClientBoundRecReturn) => reg.emitPromise("obs_preview_init", rect),
    preview_destroy: (id: string) => reg.emitPromise("obs_preview_destroy", id),
    resizePreview: (id: string, react: ClientBoundRecReturn) => reg.emitPromise("obs_preview_resize", id, react),


    availableMonitors: () => reg.emitPromise("obs_available_monitors"),
    availableWindows: (game: boolean) => reg.emitPromise("obs_available_windows", game),

    switchDesktop: (monitor: number) => reg.emitPromise("obs_switch_desktop", monitor),
    switchWindow: (options: WindowOptions) => reg.emitPromise("obs_switch_window", options),


    startRecording: () => reg.emitPromise("obs_start_recording"),
    stopRecording: () => reg.emitPromise("obs_stop_recording"),
    onRecordChange: (callback: ListenerType) => listeners.push(callback),
    recordDescription: () => reg.emitSync("obs_get_record_description")
}

export default obs;