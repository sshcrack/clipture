import { RegManRender } from '@general/register/render';

const videos = {
    list: () => RegManRender.emitPromise("video_list"),
}

export default videos