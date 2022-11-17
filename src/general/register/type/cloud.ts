import { BasicUser, IsLikedResponse } from '@backend/managers/cloud/discover/interface';
import { CloudClip, CloudClipStatus, CloudUsage, DiscoverClip, DiscoverResponse } from '@backend/managers/cloud/interface';
import { addPrefixUnderscoreToObject } from 'src/types/additions';
export type CloudEventsPromises = addPrefixUnderscoreToObject<{
    delete: (clipName: string) => void,
    delete_id: (id: string) => void,
    upload: (clipName: string, notify: boolean) => void,
    share: (clipName: string) => void,
    share_id: (id: string) => void,
    list: () => CloudClip[],
    uploading: () => ReadonlyArray<CloudClipStatus>,
    rename: (id: string, newName: string) => unknown,
    usage: () => CloudUsage,
    thumbnail: (id: string) => string,
    open_id: (id: string) => void,
    discover_list: (offset: number, limit: number, search?: string) => DiscoverResponse,
    discover_visibility: (id: string, isPublic: boolean) => unknown,
    discover_is_liked: (id: string) => IsLikedResponse
    discover_set_liked: (id: string, liked: boolean) => unknown,
    discover_get_user: (cuid: string) => BasicUser
    discover_get_clip: (id: string) => DiscoverClip
}, "cloud">

export type CloudMainToRender = addPrefixUnderscoreToObject<{
    update: (uploading: ReadonlyArray<CloudClipStatus>) => unknown,
    usageUpdate: (usage: CloudUsage) => unknown,
    done: () => unknown
}, "cloud">