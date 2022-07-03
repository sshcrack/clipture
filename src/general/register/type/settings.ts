import { addPrefixUnderscoreToObject } from 'src/types/additions';

export type SettingsEventsPromises = addPrefixUnderscoreToObject<{
    get_clip_path: () => string,
    set_clip_path: (path: string) => void,
}, "settings">