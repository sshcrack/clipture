import { OBSRecordError } from '@backend/managers/obs/core/interface';
import { WindowInformation } from '@backend/managers/obs/Scene/interfaces';
import type { ClientBoundRecReturn, CurrRec, Encoder } from '@backend/managers/obs/types';
import { Progress } from '@backend/processors/events/interface';
import { getAddRemoveListener } from '@general/tools/listener';
import type { OBSSettings } from '@Globals/storage';
import { RegManRender } from '@register/render';
import { PerformanceStatistics } from 'src/types/obs/obs-studio-node';

const reg = RegManRender
type ListenerType = (recording: boolean) => void
type ListenerPerformance = (stats: PerformanceStatistics) => void
type ListenerRecordError = (err: OBSRecordError) => void
type ListenerAutoConfig = (err: Progress) => void

const listeners = [] as ListenerType[]
const listenersPerformance = [] as ListenerPerformance[]
const listenersRecordError = [] as ListenerRecordError[]
const listenersAutoConfig = [] as ListenerAutoConfig[]

reg.on("obs_record_change", (_, recording: boolean) => listeners.map(e => e(recording)))
reg.on("performance", (_, stats) => listenersPerformance.map(e => e(stats)))
reg.on("obs_record_error", (_, err) => listenersRecordError.map(e => e(err)))
reg.on("obs_auto_config_progress", (_, prog) => listenersAutoConfig.map(e => e(prog)))

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
    onRecordChange: (callback: ListenerType) => getAddRemoveListener(callback, listeners),
    recordDescription: () => reg.emitSync("obs_get_record_description"),
    isRecording: () => reg.emitSync("obs_is_recording"),
    recordTime: () => reg.emitPromise("obs_record_time"),

    onPerformanceReport: (callback: ListenerPerformance) => getAddRemoveListener(callback, listenersPerformance),

    getCurrent: () => reg.emitPromise("obs_get_current"),
    getSettings: () => reg.emitPromise("obs_get_settings"),
    updateSettings: (e: Partial<OBSSettings>) => reg.emitPromise("obs_update_settings", e),
    automaticRecord: (autoRecord: boolean) => reg.emitPromise("obs_automatic_record", autoRecord),
    isAutoRecord: () => reg.emitPromise("obs_is_automatic_record"),

    refreshGames: () => reg.emitPromise("obs_game_refresh"),

    getEncoder: () => reg.emitPromise("obs_get_encoders"),
    getPresets: (encoder: Encoder) => reg.emitPromise("obs_get_presets", encoder),
    getRec: () => reg.emitPromise("obs_get_rec"),
    setRec: (c: CurrRec) => reg.emitPromise("obs_set_rec", c),

    onRecordError: (callback: ListenerRecordError) => getAddRemoveListener(callback, listenersRecordError),


    onAutoConfigProgress: (callback: ListenerAutoConfig) => getAddRemoveListener(callback, listenersAutoConfig),
    startAutoConfig: () => reg.emitPromise("obs_auto_config")
}

export default obs;