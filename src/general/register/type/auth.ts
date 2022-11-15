import { SessionData, SessionStatus } from '@backend/managers/auth/interfaces';
import { addPrefixUnderscoreToObject } from 'src/types/additions';

export type AuthEventsPromises = addPrefixUnderscoreToObject<{
    authenticate: () => string,
    get_session: () => { data: SessionData, status: SessionStatus },
    signout: () => void,
    is_offline: () => boolean
}, "auth">

export type AuthMainToRender = addPrefixUnderscoreToObject<{
    update: () => void
}, "auth">