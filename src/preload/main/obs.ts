import { WindowInformation } from '@backend/managers/obs/Scene/interfaces';
import type { ClientBoundRecReturn } from '@backend/managers/obs/types';
import type { OBSSettings } from '@Globals/storage';
import { RegManRender } from '@register/render';
import { PerformanceStatistics } from 'src/types/obs/obs-studio-node';

const reg = RegManRender
type ListenerType = (recording: boolean) => void
type ListenerPerformance = (stats: PerformanceStatistics) => void
const listeners = [] as ListenerType[]
const listenersPerformance = [] as ListenerPerformance[]

reg.on("obs_record_change", (_, recording: boolean) => listeners.map(e => e(recording)))
reg.on("performance", (_, stats) => listenersPerformance.map(e => e(stats)))

const obs = {
    isInitialized: () => reg.emitSync("obs_is_initialized"),
    initialize: () => reg.emitPromise("obs_initialize"),

    preview_init: (rect: ClientBoundRecReturn) => reg.emitPromise("obs_preview_init", rect),
    preview_destroy: (id: string) => reg.emitPromise("obs_preview_destroy", id),
    resizePreview: (id: string, react: ClientBoundRecReturn) => reg.emitPromise("obs_preview_resize", id, react),


    availableMonitors: () => reg.emitPromise("obs_available_monitors"),

    switchDesktop: (monitor: number, manual: boolean) => reg.emitPromise("obs_switch_desktop", monitor, manual),
    switchWindow: (options: WindowInformation, manual: boolean) => reg.emitPromise("obs_switch_window", options, manual),


    startRecording: (manual: boolean) => reg.emitPromise("obs_start_recording", manual),
    stopRecording: (manual: boolean) => reg.emitPromise("obs_stop_recording", manual),
    onRecordChange: (callback: ListenerType) => {
        listeners.push(callback)
        return () => {
            listeners.splice(listeners.indexOf(callback), 1)
        }
    },
    recordDescription: () => reg.emitSync("obs_get_record_description"),
    isRecording: () => reg.emitSync("obs_is_recording"),
    recordTime: () => reg.emitPromise("obs_record_time"),

    onPerformanceReport: (callback: ListenerPerformance) => {
        listenersPerformance.push(callback)
        return () => {
            listenersPerformance.splice(listenersPerformance.indexOf(callback), 1)
        }
    },

    getCurrent: () => reg.emitPromise("obs_get_current"),
    getSettings: () => reg.emitPromise("obs_get_settings"),
    setSettings: (e: OBSSettings) => reg.emitPromise("obs_set_settings", e),
    updateSettings: (fps: number, bitrate: number) => reg.emitPromise("obs_update_settings", fps, bitrate)
}

export default obs;