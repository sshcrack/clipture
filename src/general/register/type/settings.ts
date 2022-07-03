import { OpenDialogReturnValue } from 'electron';
import { addPrefixUnderscoreToObject } from 'src/types/additions';

export type SettingsEventsPromises = addPrefixUnderscoreToObject<{
    get_clip_path: () => string,
    set_clip_path: (path: string) => void,
    select_folder: (defaultPath?: string) => OpenDialogReturnValue,
    open_folder: (p: string) => string
}, "settings">