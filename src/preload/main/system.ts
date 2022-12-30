import { RegManRender } from '@general/register/render';
import { getAddRemoveListener } from '@general/tools/listener';
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
    addCloseAskListener: (callback: CloseListenerFunc) => getAddRemoveListener(callback, closeListeners),
    setCloseBehavior: (behavior: "minimize" | "close") => RegManRender.emitPromise("system_set_close_behavior", behavior),
    closeCurrWindow: () => RegManRender.emitPromise("system_close_curr_window"),

    setAutolaunch: (launch: boolean) => RegManRender.emitPromise("system_set_autolaunch", launch),
    isAutolaunch: () => RegManRender.emitPromise("system_is_autolaunch"),

    addTrayEventListener: (func: ToTrayIconFunc) => getAddRemoveListener(func, trayIconListeners),
    setLanguage: (lang: string) => RegManRender.emitPromise("system_change_language", lang),
    getLanguage: () => RegManRender.emitPromise("system_get_language"),

    saveDebugFile: () => RegManRender.emitPromise("system_debug_get"),
    openDriverPage: (driverType: "nvidia" | "amd") => RegManRender.emitPromise("system_driver_open", driverType)
}
export default system;