export type IsLikedResponse = {
    liked: boolean,
    count: number
}

export type BasicUser = {
    name: string | null,
    id: string | null
}

export type SuccessResponse = {
    success: boolean
}