import { CaptureMethod } from '@backend/managers/obs/core/interface';
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

    previewInit: (rect: ClientBoundRecReturn) => reg.emitPromise("obs_preview_init", rect),
    previewDestroy: (id: string) => reg.emitPromise("obs_preview_destroy", id),
    resizePreview: (id: string, react: ClientBoundRecReturn) => reg.emitPromise("obs_preview_resize", id, react),
    previewSize: () => reg.emitPromise("obs_preview_size"),


    availableMonitors: () => reg.emitPromise("obs_available_monitors"),

    switchDesktop: (monitor: number) => reg.emitPromise("obs_switch_desktop", monitor),
    switchWindow: (options: WindowInformation) => reg.emitPromise("obs_switch_window", options),

    getSceneInfo: () => reg.emitPromise("obs_scene_info"),


    startRecording: () => reg.emitPromise("obs_start_recording"),
    stopRecording: () => reg.emitPromise("obs_stop_recording"),
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
    updateSettings: (fps: number, bitrate: number, captureMethod: CaptureMethod) => reg.emitPromise("obs_update_settings", fps, bitrate, captureMethod),
    automaticRecord: (autoRecord: boolean) => reg.emitPromise("obs_automatic_record", autoRecord),
    isAutoRecord: () => reg.emitPromise("obs_is_automatic_record")
}

export default obs;