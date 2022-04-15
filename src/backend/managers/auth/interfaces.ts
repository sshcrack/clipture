export enum SessionStatus {
    LOADING = 0,
    AUTHENTICATED = 1,
    UNAUTHENTICATED = 2
}

export interface SessionData {
    user: User;
    expires: string;
}

export interface User {
    name: string;
    email: string;
    image: string;
}
