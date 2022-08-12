import { webContentsToWindow } from '@backend/tools/window'
import { BrowserWindow, IpcMainInvokeEvent, screen } from 'electron'
import { MainLogger } from 'src/interfaces/mainLogger'
import { NodeObs as typedObs } from 'src/types/obs/obs-studio-node'
import { v4 as uuid } from "uuid"
import { RegManMain } from '../../../../general/register/main'
import { Scene } from '../Scene'
import { getDisplayInfo } from '../Scene/display'
import { importOBS } from '../tool'
import { ClientBoundRecReturn } from '../types'

const log = MainLogger.get("Backend", "Managers", "OBS", "Preview")
const reg = RegManMain

export class PreviewManager {
    public displayWindowMap = new Map<string, BrowserWindow>()
    private NodeObs: typedObs;
    private initialized = false
    static instance: PreviewManager = null;

    constructor() {
        if (PreviewManager.instance)
            throw new Error("Preview class cannot be instantiated twice.")

        PreviewManager.instance = this;
        this.register()
    }

    public async initialize() {
        if(this.initialized)
            return

        this.NodeObs = (await importOBS()).NodeObs
        this.initialized = true
    }

    private register() {
        reg.onPromise("obs_preview_init", (e, bounds) => this.initPreview(e, bounds))
        reg.onPromise("obs_preview_resize", (e, id, bounds) => this.resizePreview(id, webContentsToWindow(e.sender), bounds))
        reg.onPromise("obs_preview_destroy", (_, id) => this.removePreview(id))
    }

    public async initPreview(event: IpcMainInvokeEvent, bounds: ClientBoundRecReturn) {
        if(!this.NodeObs)
            throw new Error("NodeObs not initialized yet.")

        const window = webContentsToWindow(event.sender)
        const handle = window.getNativeWindowHandle()
        const displayId = "PREVIEW_" + uuid()
        log.info("Initializing preview on", window.id, "total", this.displayWindowMap.size + 1)
        log.info("Creating Preview Display on id", displayId)

        this.NodeObs.OBS_content_createSourcePreviewDisplay(
            handle,
            Scene.get().name,
            displayId
        )
        this.NodeObs.OBS_content_setShouldDrawUI(displayId, false)
        this.NodeObs.OBS_content_setPaddingSize(displayId, 0)
        this.NodeObs.OBS_content_setPaddingColor(displayId, 255, 255, 255)

        this.displayWindowMap.set(displayId, window);
        const setting = Scene.getCurrentSetting()
        return {
            displayId,
            sceneSize: setting?.size,
            preview: await this.resizePreview(displayId, window, bounds)
        }
    }

    public async resizePreview(displayId: string, window: BrowserWindow, bounds: ClientBoundRecReturn) {
        if(!this.NodeObs)
            throw new Error("could not resize. OBS is not initialized yet.")

        const winBounds = window.getBounds();
        const currScreen = screen.getDisplayNearestPoint({ x: winBounds.x, y: winBounds.y });

        let { aspectRatio } = await getDisplayInfo(currScreen);
        const displayWidth = Math.floor(bounds.width);
        const displayHeight = Math.round(displayWidth / aspectRatio);
        const displayX = Math.floor(bounds.x);
        const displayY = Math.floor(bounds.y);

        log.debug("Resizing display w:", displayWidth, "h:", displayHeight, "x:", displayX, "y:", displayY)
        this.NodeObs.OBS_content_resizeDisplay(displayId, displayWidth, displayHeight);
        this.NodeObs.OBS_content_moveDisplay(displayId, displayX, displayY);
        return { height: displayHeight, width: displayWidth }
    }

    public async removePreview(displayId: string) {
        if(!this.NodeObs)
            throw new Error("could not remove. OBS is not initialized yet.")

        log.debug("Destroying display with id", displayId)
        const window = this.displayWindowMap.get(displayId)
        if (!window)
            throw new Error("Window with id " + displayId + " could not be found.")

        this.NodeObs.OBS_content_destroyDisplay(displayId)

        log.log("Destroyed display with id", displayId)
    }

    public async shutdown() {
        const allPreviews = Array.from(this.displayWindowMap.keys())
        const proms = allPreviews.map(k => this.removePreview(k))
        await Promise.all(proms)
    }
}