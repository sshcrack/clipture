import { SessionData, SessionStatus } from '@backend/managers/auth/interfaces'
import { LockedReturnType } from '@backend/managers/lock/interface'
import { GameOptions } from '@backend/managers/obs/Scene'
import { WindowInformation } from '@backend/managers/obs/Scene/interfaces'
import { ClientBoundRecReturn } from '@backend/managers/obs/types'
import { Progress } from '@backend/processors/events/interface'

export type RegisterEvents = {
    obs_is_initialized: () => boolean,
    lock_set: (locked: boolean, prog: Progress) => boolean,
    lock_update: (prog: Progress) => void,
    lock_add_listener: () => void,
    lock_is_locked: () => LockedReturnType,
    auth_signout: () => void
}

export type RegisterEventsPromises = {
    obs_initialize: () => void,
    auth_authenticate: () => string,
    auth_get_session:  () => { data: SessionData, status: SessionStatus },
    obs_available_windows: (game: boolean) => WindowInformation[],
    obs_available_monitors: () => number,
    obs_preview_init: ({ width, height, x, y}: ClientBoundRecReturn) => ({ height: number }),
    obs_switch_desktop: (monitor_id: number) => void,
    obs_switch_game: (options: GameOptions) => void,
    obs_resize_preview: ({ width, height, x, y}: ClientBoundRecReturn) => ({ height: number }),
}

export type MainToRender = {
    lock_update: (locked: boolean, prog: Progress) => void,
    auth_update: () => void
}

export type Prefixes = "obs"