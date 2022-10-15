import { RegManRender } from '@general/register/render';

const videos = {
    list: () => RegManRender.emitPromise("video_list"),
    thumbnail: (videoName: string) => RegManRender.emitPromise("video_thumbnail", videoName),
    rename: (original: string, newName: string) => RegManRender.emitPromise("video_rename", original, newName)
}

export default videos