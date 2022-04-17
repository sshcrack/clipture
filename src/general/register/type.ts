import { SessionData, SessionStatus } from '@backend/managers/auth/interfaces'
import { LockedReturnType } from '@backend/managers/lock/interface'
import { WindowInformation, WindowOptions } from '@backend/managers/obs/Scene/interfaces'
import { ClientBoundRecReturn } from '@backend/managers/obs/types'
import { Progress } from '@backend/processors/events/interface'
import { ProcessDescriptor } from 'ps-list'

export type RegisterEvents = {
    obs_is_initialized: () => boolean,
    obs_is_recording: () => boolean,
    obs_get_record_description: () => string

    auth_signout: () => void

    lock_set: (locked: boolean, prog: Progress) => boolean,
    lock_update: (prog: Progress) => void,
    lock_is_locked: () => LockedReturnType,
}

export type RegisterEventsPromises = {
    auth_authenticate: () => string,
    auth_get_session: () => { data: SessionData, status: SessionStatus },


    obs_initialize: () => void,
    obs_available_windows: (game: boolean) => WindowInformation[],
    obs_available_monitors: () => number,
    obs_preview_init: ({ width, height, x, y }: ClientBoundRecReturn) => ({ height: number }),
    obs_switch_desktop: (monitor_id: number) => void,
    obs_switch_window: (options: WindowOptions) => void,
    obs_resize_preview: ({ width, height, x, y }: ClientBoundRecReturn) => ({ height: number }),
    obs_start_recording: () => void,
    obs_stop_recording: () => void
}

export type MainToRender = {
    lock_update: (locked: boolean, prog: Progress) => void,
    auth_update: () => void,
    process_create: (details: ProcessDescriptor[]) => void,
    obs_record_change: (recording: boolean) => void,
}

export type Prefixes = "obs"