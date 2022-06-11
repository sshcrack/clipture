import { getOS, OS } from '@backend/tools/operating-system'
import { webContentsToWindow } from '@backend/tools/window'
import { NodeObs as notTypedOBS } from '@streamlabs/obs-studio-node'
import { BrowserWindow, IpcMainInvokeEvent, screen } from 'electron'
import { MainLogger } from 'src/interfaces/mainLogger'
import { NodeObs } from 'src/types/obs/obs-studio-node'
import { v4 as uuid } from "uuid"
import { RegManMain } from '../../../../general/register/main'
import { Scene } from '../Scene'
import { getDisplayInfo } from '../Scene/display'
import { ClientBoundRecReturn } from '../types'

const NodeObs: NodeObs = notTypedOBS
const log = MainLogger.get("Backend", "Managers", "OBS", "Preview")
const reg = RegManMain
declare const PREVIEW_WINDOW_WEBPACK_ENTRY: string;
declare const PREVIEW_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
export class PreviewManager {
    public displayWindowMap = new Map<string, BrowserWindow>()
    static instance: PreviewManager = null;
    private shuttingDown = false

    constructor() {
        if (PreviewManager.instance)
            throw new Error("Preview class cannot be instantiated twice.")

        PreviewManager.instance = this;
        this.register()
    }

    private register() {
        reg.onPromise("obs_preview_init", (e, bounds) => this.initPreview(e, bounds))
        reg.onPromise("obs_preview_resize", (_, id, bounds) => this.resizePreview(id, bounds))
        reg.onPromise("obs_preview_destroy", (_, id) => this.removePreview(id))
    }

    public async initPreview(e: IpcMainInvokeEvent, bounds: ClientBoundRecReturn) {
        const parentWin = webContentsToWindow(e.sender)
        const previewWin = new BrowserWindow({
            height: 600,
            width: 800,
            resizable: false,
            fullscreenable: false,
            backgroundColor: "blue",
            closable: false,
            parent: parentWin,
            frame: false,
            webPreferences: {
                preload: PREVIEW_WINDOW_PRELOAD_WEBPACK_ENTRY,
                nodeIntegration: false,
            }
        })

        previewWin.loadURL(PREVIEW_WINDOW_WEBPACK_ENTRY)
        previewWin.on("will-move", e => e.preventDefault())
        previewWin.on("will-resize", e => e.preventDefault())
        previewWin.on("close", e => {
            if(this.shuttingDown)
                return

            e.preventDefault()
        })


        const handle = previewWin.getNativeWindowHandle()
        const displayId = "PREVIEW_" + uuid()
        log.info("Initializing preview on", previewWin.id)
        log.info("Creating Preview Display on id", displayId)


        NodeObs.OBS_content_createSourcePreviewDisplay(
            handle,
            Scene.get().name,
            displayId
        )
        NodeObs.OBS_content_setShouldDrawUI(displayId, false)
        NodeObs.OBS_content_setPaddingSize(displayId, 0)
        NodeObs.OBS_content_setPaddingColor(displayId, 255, 255, 255)

        this.displayWindowMap.set(displayId, previewWin);
        return {
            displayId,
            preview: await this.resizePreview(displayId, bounds)
        }
    }

    public async resizePreview(displayId: string, bounds: ClientBoundRecReturn) {
        const window = this.displayWindowMap.get(displayId)
        if(!window)
            return

        const winBounds = window.getBounds();
        const currScreen = screen.getDisplayNearestPoint({ x: winBounds.x, y: winBounds.y });

        let { aspectRatio, scaleFactor } = await getDisplayInfo(currScreen);
        scaleFactor = 1
        if (getOS() === OS.Mac) {
        }

        const displayWidth = Math.floor(bounds.width);
        const displayHeight = Math.round(displayWidth / aspectRatio);
        const displayX = Math.floor(bounds.x);
        const displayY = Math.floor(bounds.y);

        const scaledW = displayWidth * scaleFactor
        const scaledH = displayHeight * scaleFactor
        const scaledX = displayX * scaleFactor
        const scaledY = displayY * scaleFactor

        window.setSize(scaledW, scaledH)
        window.setPosition(scaledX, scaledY)


        log.debug("Resizing display w:", scaledW, "h:", scaledH, "x:", scaledX, "y:", scaledY)
        NodeObs.OBS_content_resizeDisplay(displayId, scaledW, scaledH);
        //NodeObs.OBS_content_moveDisplay(displayId, scaledX, scaledY);
        return { height: displayHeight }
    }

    public async removePreview(displayId: string) {
        log.debug("Destroying display with id", displayId)
        const window = this.displayWindowMap.get(displayId)
        if (!window)
            throw new Error("Window with id " + displayId + " could not be found.")

        if (!window.isDestroyed())
            window.close()
        NodeObs.OBS_content_destroyDisplay(displayId)
        this.displayWindowMap.delete(displayId)

        log.log("Destroyed display with id", displayId)
    }

    public shutdown() {
        this.shuttingDown = true
        const windows = Array.from(this.displayWindowMap.keys())
        const proms = windows.map(id => this.removePreview(id))

        return Promise.all(proms)
    }
}