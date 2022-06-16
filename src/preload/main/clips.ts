import { RegManRender } from '@general/register/render';

const clips = {
    list: () => RegManRender.emitPromise("clips_list"),
    cut: (clipName: string, selectStart: number, selectEnd: number) => RegManRender.emitPromise("clips_cut", { clipName, start: selectStart, end: selectEnd })
}

export default clips;