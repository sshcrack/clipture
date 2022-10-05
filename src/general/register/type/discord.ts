import { addPrefixUnderscoreToObject } from 'src/types/additions'

export type DiscordEventsPromises = addPrefixUnderscoreToObject<{
    get: () => boolean,
    set: (enable: boolean) => void
}, "discord">