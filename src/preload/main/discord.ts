import { RegManRender } from '@general/register/render'

const discord = {
    get: () => RegManRender.emitPromise("discord_get"),
    set: (enabled: boolean) => RegManRender.emitPromise("discord_set", enabled)
}

export default discord