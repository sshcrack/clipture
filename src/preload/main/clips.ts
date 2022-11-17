import { AdditionalCutInfo, ClipCutInfo } from '@backend/managers/clip/interface';
import { Progress } from '@backend/processors/events/interface';
import { RegManRender } from '@general/register/render';
import { getAddRemoveListener } from '@general/tools/listener';

const listeners: ((clip: ClipCutInfo, prog: Progress) => void)[] = []
const clips = {
    currently_cutting: () => RegManRender.emitPromise("clips_cutting"),
    add_listener: (onUpdate: (clip: ClipCutInfo, prog: Progress) => void) => {
        const func = (clip: ClipCutInfo, prog: Progress) => {
            onUpdate(clip, prog)
            console.log("Preload update", clip, prog)
        }
        return getAddRemoveListener(func, listeners)
    },
    list: () => RegManRender.emitPromise("clips_list"),
    thumbnail: (clipName: string) => RegManRender.emitPromise("clips_thumbnail", clipName),
    exists: (name: string) => RegManRender.emitPromise("clips_exists", name),
    cut: async (cutInfo: ClipCutInfo, onProgress: (prog: Progress) => void, additional: AdditionalCutInfo = { isPublic: false, upload: false }) => {
        const prom = RegManRender.emitPromise("clips_cut", cutInfo, additional)
        const { end: selectEnd, start: selectStart, videoName } = cutInfo
        const listener = (clip: ClipCutInfo, prog: Progress) => {
            if (clip.videoName !== videoName || clip.start !== selectStart || clip.end !== selectEnd)
                return

            onProgress(prog)
        }

        return prom.finally(() => {
            const index = listeners.indexOf(listener)
            if (index === -1)
                return console.log("Invalid index for listener with video", videoName)
            listeners.splice(index, 1)
        })
    },
    delete: (clipName: string) => RegManRender.emitPromise("clips_delete", clipName),
    rename: (original: string, newName: string) => RegManRender.emitPromise("clips_rename", original, newName)
}

RegManRender.on("clips_update", (_, x, y) => {
    listeners.map(e => e(x, y))
    console.log("Preload listeners notify")
})
export default clips;