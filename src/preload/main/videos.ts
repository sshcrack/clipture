import { RegManRender } from '@general/register/render';
import { getAddRemoveListener } from '@general/tools/listener';

const listeners: (() => void)[] = []
const videos = {
    list: () => RegManRender.emitPromise("video_list"),
    thumbnail: (videoName: string) => RegManRender.emitPromise("video_thumbnail", videoName),
    rename: (original: string, newName: string) => RegManRender.emitPromise("video_rename", original, newName),
    add_listener: (onUpdate: () => void) => {
        const func = () => onUpdate()
        return getAddRemoveListener(func, listeners)
    },
}

export default videos