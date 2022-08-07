import { RegManRender } from "@general/register/render"

const bookmark = {
    getHotkey: () => RegManRender.emitPromise("bookmark_hotkey_get"),
    setHotkey: (hotkey: string) => RegManRender.emitPromise("bookmark_hotkey_set", hotkey),
    listenKey: () => RegManRender.emitPromise("bookmark_listen_key")
}

export default bookmark