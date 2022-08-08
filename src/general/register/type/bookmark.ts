import { addPrefixUnderscoreToObject } from 'src/types/additions';
export type BookmarkEventsPromises = addPrefixUnderscoreToObject<{
    hotkey_set: (hotkey: string) => void,
    hotkey_get: () => string,
    listen_key: () => string | undefined
}, "bookmark">

export type BookmarkMainToRender = addPrefixUnderscoreToObject<{
}, "bookmark">