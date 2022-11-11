import { CloudClip, CloudClipStatus, CloudUsage, DiscoverResponse } from '@backend/managers/cloud/interface';
import { addPrefixUnderscoreToObject } from 'src/types/additions';
export type CloudEventsPromises = addPrefixUnderscoreToObject<{
    delete: (clipName: string) => void,
    delete_id: (id: string) => void,
    upload: (clipName: string) => void,
    share: (clipName: string) => void,
    share_id: (id: string) => void,
    list: () => CloudClip[],
    uploading: () => ReadonlyArray<CloudClipStatus>,
    rename: (id: string, newName: string) => unknown,
    usage: () => CloudUsage,
    thumbnail: (id: string) => string,
    open_id: (id: string) => void,
    discover_list: (offset: number, limit: number) => DiscoverResponse,
    discover_visibility: (id: string, isPublic: boolean) => unknown
}, "cloud">

export type CloudMainToRender = addPrefixUnderscoreToObject<{
    update: (uploading: ReadonlyArray<CloudClipStatus>) => unknown,
    usageUpdate: (usage: CloudUsage) => unknown
}, "cloud">