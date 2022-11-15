export enum SessionStatus {
    LOADING = 0,
    AUTHENTICATED = 1,
    UNAUTHENTICATED = 2,
    OFFLINE = 3
}

export interface SessionData {
    user: User;
    expires: string;
}

export type SessionInfo = {
    data: SessionData,
    status: SessionStatus
}

export interface User {
    name: string;
    email: string;
    image: string;
}

export type OfflineChangeListener = (offline: boolean) => unknown