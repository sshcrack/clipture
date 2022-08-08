import { LockedReturnType } from '@backend/managers/lock/interface';
import { Progress } from '@backend/processors/events/interface';
import { addPrefixUnderscoreToObject } from 'src/types/additions';

export type LockEventsSync = addPrefixUnderscoreToObject<{
    set: (locked: boolean, prog: Progress) => boolean,
    update: (prog: Progress) => void,
    is_locked: () => LockedReturnType,
}, "lock">

export type LockMainToRender = addPrefixUnderscoreToObject<{
    update: (locked: boolean, prog: Progress) => void,
}, "lock">