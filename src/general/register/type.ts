export type RegisterEvents = {
    obs_is_initialized: () => boolean
}

export type RegisterEventsPromises = {
    obs_initialize: () => void
}

export type Prefixes = "obs"