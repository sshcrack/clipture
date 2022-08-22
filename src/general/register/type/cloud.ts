import { CloudClip } from '@backend/managers/cloud/interface';
import { addPrefixUnderscoreToObject } from 'src/types/additions';
export type CloudEventsPromises = addPrefixUnderscoreToObject<{
    delete: (clipName: string) => void,
    upload: (clipName: string) => void,
    list: () => CloudClip[]
}, "cloud">

export type CloudMainToRender = addPrefixUnderscoreToObject<{
}, "cloud">