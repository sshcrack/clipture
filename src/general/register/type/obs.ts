import { CaptureMethod, OutCurrentType } from '@backend/managers/obs/core/interface'
import { WindowInformation } from '@backend/managers/obs/Scene/interfaces'
import { ClientBoundRecReturn } from '@backend/managers/obs/types'
import type { OBSSettings } from '@Globals/storage'
import { addPrefixUnderscoreToObject } from 'src/types/additions'

export type OBSEventsSync = addPrefixUnderscoreToObject<{
    is_initialized: () => boolean,
    is_recording: () => boolean,
    get_record_description: () => string
}, "obs">

export type OBSEventsPromises = addPrefixUnderscoreToObject<{
    initialize: () => void,
    update_settings: (fps: number, bitrate: number, capture_method: CaptureMethod) => void,
    get_settings: () => OBSSettings,
    set_settings: (e: OBSSettings) => void,
    available_monitors: () => number,
    preview_init: (bounds: ClientBoundRecReturn) => ({
        displayId: string,
        preview: { height: number, width: number },
        sceneSize: { height: number, width: number }
    }),
    preview_destroy: (id: string) => void,
    preview_resize: (displayId: string, { width, height, x, y }: ClientBoundRecReturn) => ({ height: number }),

    switch_desktop: (monitor_id: number, manual: boolean) => void,
    switch_window: (options: WindowInformation, manual: boolean) => void,
    start_recording: (manual: boolean) => void,
    stop_recording: (manual: boolean) => void,
    get_current: () => OutCurrentType,

    record_time: () => number | undefined
}, "obs">

export type OBSMainToRender = addPrefixUnderscoreToObject<{
    record_change: (recording: boolean) => void,
}, "obs">