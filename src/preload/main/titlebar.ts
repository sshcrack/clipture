import { ipcRenderer, IpcRendererEvent } from 'electron'

type MaximizeListener = (e: IpcRendererEvent, isWindowMaximized: boolean, targetBrowserWindowId: number) => unknown

export const titlebar = {
    addMaximizeChange: (listener: MaximizeListener) => ipcRenderer.on("electron-react-titlebar/maximize/change", listener),
    initialize: (id: number) => ipcRenderer.invoke("electron-react-titlebar/initialize", id) as Promise<number>,
    removeMaximizeChange: (listener: MaximizeListener) => ipcRenderer.removeListener("electron-react-titlebar/maximize/change", listener),
    setMaximized: (id: number) => ipcRenderer.send("electron-react-titlebar/maximize/set", id),
    setMinimized: (id: number) => ipcRenderer.send("electron-react-ttilebar/minimize/set", id),
    setClose: (id: number) => ipcRenderer.send("electron-react-titlebar/close", id)
}

export default titlebar