import { RecordManager } from '@backend/managers/obs/core/record';
import { Scene } from '@backend/managers/obs/Scene';
import { MonitorDimensions } from '@backend/managers/obs/Scene/interfaces';
import { RegManMain } from '@general/register/main';
import { cppHWNDToBuffer, rectToDimension } from '@general/tools/native';
import { Storage } from '@Globals/storage';
import overlay, { OverlayId, RECT } from "@streamlabs/game_overlay";
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { MainLogger } from 'src/interfaces/mainLogger';
import { GameManager } from '..';
import { OverlayAlignment, ParentInfo } from './interface';


declare const OVERLAY_WINDOW_WEBPACK_ENTRY: string;
declare const OVERLAY_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const OVERLAY_HEIGHT_PERCENTAGE = .04

const log = MainLogger.get("Managers", "Game", "Overlay")
export class OverlayManager {
    private static initialized = false
    private static currentId: OverlayId = null
    private static currentHWND: number = null
    private static win: BrowserWindow = null

    static initialize() {
        if (this.initialized)
            return


        RecordManager.instance.addRecordListener(recording => {
            if (!recording) {
                this.currentId && this.stopOverlay()
                this.currentHWND = null
                return
            }

            const { window } = Scene.getCurrentSetting() ?? {}
            if (!window)
                return

            this.currentHWND = window.hwnd
            const enabled = Storage.get("overlay_enabled")
            if (!enabled)
                return


            this.startOverlay(window)
        })

        log.info("Initializing...")
        const isFine = overlay.start(path.join(app.getPath("logs"), "overlay.log"));
        if(isFine !== 1)
            throw new Error("Could not start overlay")

        overlay.setWindowPosCallback((hwnd, rect) => {
            this.handleResize(hwnd, rect)
        })
        this.initializeWindow();

        this.initialized = true
    }

    static initializeWindow() {
        this.win = new BrowserWindow({
            show: false,
            transparent: true,
            width: 700,
            height: 700,
            frame: false,
            webPreferences: {
                offscreen: true,
                preload: OVERLAY_WINDOW_PRELOAD_WEBPACK_ENTRY
            },
        })

        this.win.loadURL(OVERLAY_WINDOW_WEBPACK_ENTRY);
        this.win.webContents.on('paint', (_, _1, image) => {
            if (!this.currentId)
                return

            overlay.paintOverlay(this.currentId, image.getSize().width, image.getSize().height, image.getBitmap());
        })

        this.win.webContents.setFrameRate(1);
        this.win.on("closed", () => { this.win = null });

        setTimeout(() => this.win && this.win.reload(), 5000)
    }

    static register() {
        RegManMain.onPromise("overlay_get_alignment", async () => Storage.get("overlay_alignment"))
        RegManMain.onPromise("overlay_get_enabled", async () => Storage.get("overlay_enabled"))
        RegManMain.onPromise("overlay_set_alignment", (_, alignment) => this.setAlignment(alignment))
        RegManMain.onPromise("overlay_set_enabled", (_, enabled) => this.setEnabled(enabled))
        RegManMain.onPromise("overlay_open_dev", async () => this.win.webContents.openDevTools({ mode: "detach" }))
    }

    static shutdown() {
        if (!this.initialized)
            return

        log.info("Shutting down...")
        overlay.stop()
        this.initialized = false
    }

    static async handleResize(hwnd: number, rect: RECT) {
        if (!this.currentId || !hwnd || this.currentHWND !== hwnd)
            return

        const { x, y, width, height } = rectToDimension(rect)
        const currAlignment = Storage.get("overlay_alignment")

        const monitor = await GameManager.getMonitorDimensions(hwnd)
        this.setPosition(currAlignment, {
            parentX: x,
            parentY: y,
            parentWidth: width,
            parentHeight: height
        }, monitor)
    }

    static setPosition(alignment: OverlayAlignment, { parentHeight, parentWidth, parentX, parentY }: ParentInfo, { height: monitorHeight }: MonitorDimensions) {
        const overlayHeight = Math.floor(monitorHeight * OVERLAY_HEIGHT_PERCENTAGE)
        const overlayWidth = overlayHeight
        const halfWidth = overlayWidth / 2
        const halfHeight = overlayHeight / 2

        let x = 0
        let y = 0

        const padding = 10

        const rightX = parentWidth - overlayWidth
        const centerX = parentWidth / 2 - halfWidth
        const centerY = parentHeight / 2 - halfHeight

        const bottomY = parentHeight - overlayHeight

        switch (alignment) {
            case OverlayAlignment.TOP_LEFT:
                // pretty useless idk just to have it in the switch
                x = padding;
                y = padding;
                break;

            case OverlayAlignment.TOP_CENTER:
                x = centerX - padding
                y = padding
                break;

            case OverlayAlignment.TOP_RIGHT:
                x = rightX - padding
                y = padding
                break;

            case OverlayAlignment.CENTER_LEFT:
                x = padding
                y = centerY
                break;

            case OverlayAlignment.CENTER_RIGHT:
                x = rightX - padding
                y = centerY
                break;

            case OverlayAlignment.BOTTOM_LEFT:
                x = padding
                y = bottomY - padding
                break;

            case OverlayAlignment.BOTTOM_CENTER:
                x = centerX
                y = bottomY - padding
                break;

            case OverlayAlignment.BOTTOM_RIGHT:
                x = rightX - padding
                y = bottomY - padding
                break;

            default:
                break;
        }

        this.win.setBounds({ height: overlayHeight, width: overlayWidth })
        overlay.setPosition(this.currentId, x + parentX, y + parentY, overlayWidth, overlayHeight)
    }

    static stopOverlay() {
        if (!this.currentId)
            return false

        log.info("Stopping overlay with id", this.currentId)
        overlay.hide()
        overlay.remove(this.currentId)
        this.currentId = null
        RegManMain.send("overlay_start_update", false)
        return true
    }

    static async startOverlay({ hwnd }: { hwnd: number }) {
        if (!hwnd)
            return

        if (this.currentId)
            this.stopOverlay()

        if (!this.win)
            this.initializeWindow()

        log.debug("Getting monitor dimensions with hwnd", hwnd)
        const monitor = await GameManager.getMonitorDimensions(hwnd).catch(e => {
            log.error("Overlay error", e)
            this.currentHWND = null
            return null
        })

        if(!monitor)
            throw new Error(`Invalid handle ${hwnd}`)

        this.currentId = overlay.addHWND(cppHWNDToBuffer(hwnd))
        this.currentHWND = hwnd
        overlay.show()
        log.info("Started overlay with id", this.currentId, "and handle", hwnd)
        overlay.setColorKey(this.currentId, true)

        const info = overlay.getInfo(this.currentId)
        log.info("Overlay info", info)

        log.debug("Setting position alignment")
        this.setPosition(Storage.get("overlay_alignment", OverlayAlignment.TOP_LEFT), info, monitor)

        this.win.webContents.invalidate();
        RegManMain.send("overlay_start_update", true)
    }

    static async setAlignment(alignment: OverlayAlignment) {
        log.debug("Setting alignment to", alignment)
        Storage.set("overlay_alignment", alignment)
        if (!this.currentId || !this.currentHWND)
            return

        log.debug("Readjusting overlay...")
        const info = overlay.getInfo(this.currentId)
        const monitor = await GameManager.getMonitorDimensions(this.currentHWND)

        this.setPosition(alignment, info, monitor)
    }

    static async setEnabled(enabled: boolean) {
        if (enabled) {
            log.silly("CurrentId", this.currentId, "hwnd", this.currentHWND, "starting:", this.currentHWND && !this.currentId)
            !this.currentId && this.currentHWND && this.startOverlay({ hwnd: this.currentHWND })
        }
        else {
            log.silly("Stopping overlay if", this.currentId, "is null")
            this.currentId && this.stopOverlay()
        }

        Storage.set("overlay_enabled", enabled)
    }
}