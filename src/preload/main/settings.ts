import { RegManRender } from '@general/register/render';

const settings = {
    get: {
        clipPath: () => RegManRender.emitPromise("settings_get_clip_path")
    },
    set: {
        clipPath: (path: string) => RegManRender.emitPromise("settings_set_clip_path", path)
    }
}

export default settings;