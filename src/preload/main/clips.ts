import { ClipCutInfo } from '@backend/managers/clip/interface';
import { Progress } from '@backend/processors/events/interface';
import { RegManRender } from '@general/register/render';

const listeners: ((clip: ClipCutInfo, prog: Progress) => void)[] = []
const clips = {
    currently_cutting: () => RegManRender.emitPromise("clips_cutting"),
    add_listener: (onUpdate: (clip: ClipCutInfo, prog: Progress) => void) => {
        const func = (clip: ClipCutInfo, prog: Progress) => {
            onUpdate(clip, prog)
            console.log("Preload update", clip, prog)
        }
        listeners.push(func)
        console.log("Listener added to listeners")
        return () => {
            const index = listeners.indexOf(func)
            if (index === -1)
                return console.log("Could not remove manual listener")

            listeners.splice(index, 1)
        }
    },
    list: () => RegManRender.emitPromise("clips_list"),
    thumbnail: (clipName: string) => RegManRender.emitPromise("clips_thumbnail", clipName),
    exists: (name: string) => RegManRender.emitPromise("clips_exists", name),
    cut: (clipName: string, videoName: string, selectStart: number, selectEnd: number, onProgress: (prog: Progress) => void) => {
        const prom = RegManRender.emitPromise("clips_cut", { videoName, start: selectStart, end: selectEnd, clipName })
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
    delete: (clipName: string) => RegManRender.emitPromise("clips_delete", clipName)
}

RegManRender.on("clip_update", (_, x, y) => {
    listeners.map(e => e(x, y))
    console.log("Preload listeners notify")
})
export default clips;