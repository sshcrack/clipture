import { RegManRender } from '@general/register/render';

const clips = {
    list: () => RegManRender.emitPromise("clips_list")
}

export default clips;