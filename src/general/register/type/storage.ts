import { DeleteMethods } from '@backend/managers/storage/interface';
import { addPrefixUnderscoreToObject } from 'src/types/additions';
export type StorageEventsPromises = addPrefixUnderscoreToObject<{
    set_delete_mode: (method: DeleteMethods[]) => unknown,
    get_delete_mode: () => DeleteMethods[],
    get_locked: () => string[]
}, "storage">

export type StorageMainToRender = addPrefixUnderscoreToObject<{
    lock: (lockedVideos: string[]) => unknown
}, "storage">