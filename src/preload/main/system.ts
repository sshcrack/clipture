import { RegManRender } from '@general/register/render';
import { ipcRenderer } from 'electron';

type ListenerFunc = () => void
const listeners = [] as ListenerFunc[]

ipcRenderer.on("close_behavior_dialog", () => listeners.map(e => e()))
const system = {
    open_clip: (clip: string) => RegManRender.emitPromise("system_open_clip", clip),
    get_dashboard_page_default: () => RegManRender.emitPromise("system_get_dashboard_page_default"),
    set_default_dashboard_page: (newIndex: number) => RegManRender.emitPromise("system_set_default_dashboard_page", newIndex),
    addCloseAskListener: (callback: ListenerFunc) => {
        listeners.push(callback)
        return () => {
            listeners.splice(listeners.indexOf(callback), 1)
        }
    },
    setCloseBehavior: (behavior: "minimize" | "close") => RegManRender.emitPromise("system_set_close_behavior", behavior),
    closeCurrWindow: () => RegManRender.emitPromise("system_close_curr_window")
}
export default system;