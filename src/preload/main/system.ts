import { RegManRender } from '@general/register/render';
import { ipcRenderer } from 'electron';

type CloseListenerFunc = () => void
const closeListeners = [] as CloseListenerFunc[]

type ToTrayIconFunc = (hidden: boolean) => void
const trayIconListeners = [] as ToTrayIconFunc[]

ipcRenderer.on("close_behavior_dialog", () => closeListeners.map(e => e()))
RegManRender.on("system_tray_event", (_, hidden) => trayIconListeners.map(e => e(hidden)))

const system = {
    open_clip: (clip: string) => RegManRender.emitPromise("system_open_clip", clip),
    get_dashboard_page_default: () => RegManRender.emitPromise("system_get_dashboard_page_default"),
    set_default_dashboard_page: (newIndex: number) => RegManRender.emitPromise("system_set_default_dashboard_page", newIndex),
    addCloseAskListener: (callback: CloseListenerFunc) => {
        closeListeners.push(callback)
        return () => {
            closeListeners.splice(closeListeners.indexOf(callback), 1)
        }
    },
    setCloseBehavior: (behavior: "minimize" | "close") => RegManRender.emitPromise("system_set_close_behavior", behavior),
    closeCurrWindow: () => RegManRender.emitPromise("system_close_curr_window"),

    setAutolaunch: (launch: boolean) => RegManRender.emitPromise("system_set_autolaunch", launch),
    isAutolaunch: () => RegManRender.emitPromise("system_is_autolaunch"),

    addTrayEventListener: (func: ToTrayIconFunc) => {
        trayIconListeners.push(func)
        return () => {
            const index = trayIconListeners.indexOf(func)
            if (index == -1)
                return

            trayIconListeners.splice(index, 1)
        }
    },
    setLanguage: (lang: string) => RegManRender.emitPromise("system_change_language", lang),
    getLanguage: () => RegManRender.emitSync("system_get_language")
}
export default system;