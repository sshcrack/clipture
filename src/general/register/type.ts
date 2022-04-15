import { SessionData, SessionStatus } from '@backend/managers/auth/interfaces'
import { LockedReturnType } from '@backend/managers/lock/interface'
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
    auth_get_session:  () => { data: SessionData, status: SessionStatus }
}

export type MainToRender = {
    lock_update: (locked: boolean, prog: Progress) => void,
    auth_update: () => void
}

export type Prefixes = "obs"