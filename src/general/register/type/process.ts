import { WindowInformation } from '@backend/managers/obs/Scene/interfaces';
import { addPrefixUnderscoreToObject } from 'src/types/additions';

export type ProcessEventsPromises = addPrefixUnderscoreToObject<{
    available_windows: (game: boolean) => WindowInformation[],
}, "process">

export type ProcessMainToRender = addPrefixUnderscoreToObject<{
    update: (old: WindowInformation[], details: WindowInformation[]) => void,
}, "process">