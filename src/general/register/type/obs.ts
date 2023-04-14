import { OBSRecordError, OutCurrentType } from '@backend/managers/obs/core/interface'
import { CurrentSetting, WindowInformation } from '@backend/managers/obs/Scene/interfaces'
import { ClientBoundRecReturn, CurrRec, Encoder } from '@backend/managers/obs/types'
import type { OBSSettings } from '@Globals/storage'
import { addPrefixUnderscoreToObject } from 'src/types/additions'

export type OBSEventsSync = addPrefixUnderscoreToObject<{
    is_initialized: () => boolean,
    is_recording: () => boolean,
    get_record_description: () => string
}, "obs">

export type OBSEventsPromises = addPrefixUnderscoreToObject<{
    initialize: () => void,
    update_settings: (settings: Partial<OBSSettings>) => void,
    get_settings: () => OBSSettings,
    available_monitors: () => number,
    preview_init: (bounds: ClientBoundRecReturn) => ({
        displayId: string,
        preview: { height: number, width: number },
        sceneSize: { height: number, width: number }
    }),
    preview_destroy: (id: string) => void,
    preview_resize: (displayId: string, { width, height, x, y }: ClientBoundRecReturn) => ({ height: number }),
    preview_size: () => ({ height: number, width: number })

    switch_desktop: (monitor_id: number) => void,
    switch_window: (options: WindowInformation) => void,
    start_recording: () => void,
    stop_recording: () => void,
    get_current: () => OutCurrentType,

    record_time: () => number | undefined,
    game_refresh: () => void,
    automatic_record: (automaticRecord: boolean) => void,
    is_automatic_record: () => boolean,

    scene_info: () => CurrentSetting,

    get_presets: (encoder: Encoder) => string[],
    get_encoders: () => Encoder[],
    get_rec: () => CurrRec,
    set_rec: (input: CurrRec) => void
}, "obs">

export type OBSMainToRender = addPrefixUnderscoreToObject<{
    record_change: (recording: boolean) => void,
    record_error: (error: OBSRecordError) => void
}, "obs">