import { RegManRender } from '@general/register/render';

const videos = {
    list: () => RegManRender.emitPromise("video_list"),
    thumbnail: (videoName: string) => RegManRender.emitPromise("video_thumbnail", videoName)
}

export default videos