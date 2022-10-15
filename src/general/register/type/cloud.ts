import { CloudClip, CloudClipStatus } from '@backend/managers/cloud/interface';
import { addPrefixUnderscoreToObject } from 'src/types/additions';
export type CloudEventsPromises = addPrefixUnderscoreToObject<{
    delete: (clipName: string) => void,
    upload: (clipName: string) => void,
    share: (clipName: string) => void,
    list: () => CloudClip[],
    uploading: () => ReadonlyArray<CloudClipStatus>,
    rename: (id: string, newName: string) => unknown
}, "cloud">

export type CloudMainToRender = addPrefixUnderscoreToObject<{
    update: (uploading: ReadonlyArray<CloudClipStatus>) => unknown
}, "cloud">