import { SessionData, SessionStatus } from '@backend/managers/auth/interfaces'
import { Clip, ClipCutInfo } from '@backend/managers/clip/interface'
import { LockedReturnType } from '@backend/managers/lock/interface'
import { WindowInformation } from '@backend/managers/obs/Scene/interfaces'
import { ClientBoundRecReturn } from '@backend/managers/obs/types'
import { Progress } from '@backend/processors/events/interface'
import { UseToastOptions } from '@chakra-ui/react'

export type RegisterEvents = {
    obs_is_initialized: () => boolean,
    obs_is_recording: () => boolean,
    obs_get_record_description: () => string

    lock_set: (locked: boolean, prog: Progress) => boolean,
    lock_update: (prog: Progress) => void,
    lock_is_locked: () => LockedReturnType,
}

export type RegisterEventsPromises = {
    auth_authenticate: () => string,
    auth_get_session: () => { data: SessionData, status: SessionStatus },
    auth_signout: () => void,

    process_available_windows: (game: boolean) => WindowInformation[],

    obs_initialize: () => void,
    obs_available_monitors: () => number,
    obs_preview_init: ({ width, height, x, y }: ClientBoundRecReturn) => {
        displayId: string,
        preview: { height: number }
    },
    obs_preview_destroy: (id: string) => void,
    obs_preview_resize: (displayId: string, { width, height, x, y }: ClientBoundRecReturn) => ({ height: number }),

    obs_switch_desktop: (monitor_id: number, manual: boolean) => void,
    obs_switch_window: (options: WindowInformation, manual: boolean) => void,
    obs_start_recording: (manual: boolean) => void,
    obs_stop_recording: (manual: boolean) => void,

    clips_list: () => Clip[],
    clips_cut: (clipsOptions: ClipCutInfo) => void,
    clips_cutting: () => [ClipCutInfo, Progress][]
}

export type MainToRender = {
    lock_update: (locked: boolean, prog: Progress) => void,
    auth_update: () => void,
    process_update: (old: WindowInformation[], details: WindowInformation[]) => void,
    obs_record_change: (recording: boolean) => void,
    toast_show: (options: UseToastOptions) => void,
    clip_update: (clip: ClipCutInfo, prog: Progress) => void
}

export type Prefixes = "obs"