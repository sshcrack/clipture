import { OverlayAlignment } from '@backend/managers/game/overlay/interface'
import { RegManRender } from '@general/register/render'
import { getAddRemoveListener } from '@general/tools/listener'

type ListenerFunc = (enabled: boolean) => unknown
const listeners = [] as ListenerFunc[]

const overlay = {
    setEnabled: (enabled: boolean) => RegManRender.emitPromise("overlay_set_enabled", enabled),
    isEnabled: () => RegManRender.emitPromise("overlay_get_enabled"),

    setAlignment: (alignment: OverlayAlignment) => RegManRender.emitPromise("overlay_set_alignment", alignment),
    getAlignment: () => RegManRender.emitPromise("overlay_get_alignment"),
    openDevWindow: () => RegManRender.emitPromise("overlay_open_dev"),
    onEnableUpdate: (callback: ListenerFunc) => getAddRemoveListener(callback, listeners)
}

export default overlay