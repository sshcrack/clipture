import { Video } from '@backend/managers/clip/interface'
import { addPrefixUnderscoreToObject } from 'src/types/additions'

export type VideoEventsPromises = addPrefixUnderscoreToObject<{
    // Returns Video in Base64
    thumbnail: (videoName: string) => string
    list: () => Video[],
}, "video">