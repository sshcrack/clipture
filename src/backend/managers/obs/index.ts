import { getOS, OS } from '@backend/tools/operating-system'
import { webContentsToWindow } from '@backend/tools/window'
import { Storage } from '@Globals/storage'
import { NodeObs as notTypedOBS } from '@streamlabs/obs-studio-node'
import { BrowserWindow, ipcMain, IpcMainInvokeEvent, screen } from 'electron'
import { SettingsCat } from 'src/types/obs/obs-enums'
import { NodeObs } from 'src/types/obs/obs-studio-node'
import { v4 as uuid } from "uuid"
import { RegManMain } from '../../../general/register/main'
import { MainLogger } from '../../../interfaces/mainLogger'
import { LockManager } from '../lock'
import { getAvailableValues, setOBSSetting as setSetting } from './base'
import { Scene } from './Scene'
import { getDisplayInfo } from './Scene/display'
import { getOBSBinary, getOBSDataPath, getOBSWorkingDir } from './tool'
import { ClientBoundRecReturn } from './types'
import fs from "fs/promises"


const NodeObs: NodeObs = notTypedOBS
const reg = RegManMain
const log = MainLogger.get("Managers", "OBS")

export class OBSManager {
    private obsInitialized = false
    private recording = false
    private displayWindowMap = new Map<string, BrowserWindow>()

    constructor() {
        this.register()
    }

    public async initialize() {
        const inst = LockManager.instance
        await inst.waitTillReleased()

        if (this.obsInitialized)
            return log.warn("OBS already initialized")

        inst.lock({
            percent: 0,
            status: "Initializing OBS..."
        })
        await this.initOBS()


        inst.updateListeners({
            percent: .3,
            status: "Configuring OBS..."
        })
        await this.configure()


        inst.updateListeners({
            percent: .6,
            status: "Initializing scene..."
        })
        Scene.initialize()

        inst.unlock({
            percent: 1,
            status: "OBS initialized"
        })

        this.obsInitialized = true
    }

    private async initOBS() {
        const hostId = `clipture-${uuid()}`;
        const workDir = getOBSWorkingDir()
        const binary = getOBSBinary();

        log.debug(`Initializing OBS... (${hostId}}`);
        log.debug("WorkDir is", workDir)

        NodeObs.IPC.setServerPath(binary, workDir)
        NodeObs.IPC.host(hostId);
        NodeObs.SetWorkingDirectory(workDir);

        const obsDataPath = getOBSDataPath()
        const initResult = NodeObs.OBS_API_initAPI("en-US", obsDataPath, "1.0.0") as number;
        if (initResult !== 0) {
            const errorReasons = {
                "-2": "DirectX could not be found on your system. Please install the latest version of DirectX for your machine here <https://www.microsoft.com/en-us/download/details.aspx?id=35?> and try again.",
                "-5": "Failed to initialize OBS. Your video drivers may be out of date, or libObs may not be supported on your system.",
            };


            const result = initResult.toString() as keyof typeof errorReasons;
            const errorMessage = errorReasons[result] ?? `An unknown error #${initResult} was encountered while initializing OBS.`;

            log.error("Could not initialize OBS", errorMessage);
            this.shutdown(true);

            throw Error(errorMessage);
        }

        log.info("Successfully initialized OBS!")
        setInterval(() =>
            ipcMain.emit("performance", NodeObs.OBS_API_getPerformanceStatistics())
            , 2000)
    }

    public async shutdown(force = false) {
        if (!this.obsInitialized && !force)
            return

        log.info("Shutting OBS down...")
        try {
            NodeObs.OBS_service_removeCallback();
            NodeObs.IPC.disconnect()
        } catch (e) {
            const newErr = new Error(`Exception when shutting down OBS process${e}`)
            log.error(newErr)

            throw newErr;
        }
    }

    private configure() {
        log.info("Configuring OBS")
        const Output = SettingsCat.Output
        const Video = SettingsCat.Video

        const availableEncoders = getAvailableValues(Output, 'Recording', 'RecEncoder');
        setSetting(Output, "Mode", "Advanced")
        setSetting(Output, 'RecEncoder', availableEncoders.slice(-1)[0] ?? 'x264');
        setSetting(Output, 'RecFilePath', Storage.get("clip_path"));
        setSetting(Output, 'RecFormat', 'mkv');
        setSetting(Output, 'VBitrate', 10000); // 10 Mbps
        setSetting(Video, 'FPSCommon', 60);

        log.info("Configured OBS successfully!")
    }

    public async initPreview(event: IpcMainInvokeEvent, bounds: ClientBoundRecReturn) {
        const window = webContentsToWindow(event.sender)
        const handle = window.getNativeWindowHandle()
        const displayId = "PREVIEW_" + uuid()
        log.info("Initializing preview on", window.id)
        log.info("Creating Preview Display on id", displayId)

        NodeObs.OBS_content_createSourcePreviewDisplay(
            handle,
            Scene.get().name,
            displayId
        )
        NodeObs.OBS_content_setShouldDrawUI(displayId, false)
        NodeObs.OBS_content_setPaddingSize(displayId, 0)
        NodeObs.OBS_content_setPaddingColor(displayId, 255, 255, 255)

        this.displayWindowMap.set(displayId, window);
        return {
            displayId,
            preview: await this.resizePreview(displayId, window, bounds)
        }
    }

    public async resizePreview(displayId: string, window: BrowserWindow, bounds: ClientBoundRecReturn) {
        const winBounds = window.getBounds();
        const currScreen = screen.getDisplayNearestPoint({ x: winBounds.x, y: winBounds.y });

        let { aspectRatio, scaleFactor } = await getDisplayInfo(currScreen);
        if (getOS() === OS.Mac) {
            scaleFactor = 1
        }
        const displayWidth = Math.floor(bounds.width);
        const displayHeight = Math.round(displayWidth / aspectRatio);
        const displayX = Math.floor(bounds.x);
        const displayY = Math.floor(bounds.y);

        NodeObs.OBS_content_resizeDisplay(displayId, displayWidth * scaleFactor, displayHeight * scaleFactor);
        NodeObs.OBS_content_moveDisplay(displayId, displayX * scaleFactor, displayY * scaleFactor);
        return { height: displayHeight }
    }

    public async removePreview(displayId: string) {
        log.debug("Destroying display with id", displayId)
        const window = this.displayWindowMap.get(displayId)
        if(!window)
            throw new Error("Window with id " + displayId + " could not be found.")

        NodeObs.OBS_content_destroyDisplay(displayId)

        log.log("Destroyed display with id", displayId)
    }

    public async startRecording() {
        if (this.recording)
            return

        const recordPath = NodeObs.OBS_settings_getSettings(SettingsCat.Output)
            .data
            .find(e => e.nameSubCategory === "Recording")
            .parameters
            .find(e => e.name === "RecFilePath")
            .currentValue as string

        if(!recordPath)
            log.warn("No Record Path set")
        else
            await fs.stat(recordPath).catch(() => fs.mkdir(recordPath))

        NodeObs.OBS_service_startRecording()
        this.recording = true
        RegManMain.send("obs_record_change", true)
    }

    public async stopRecording() {
        if (!this.recording)
            return

        log.info("Stopped recording")
        NodeObs.OBS_service_stopRecording()
        this.recording = false
        RegManMain.send( "obs_record_change", false)
    }

    public isRecording() {
        return this.recording;
    }


    public register() {
        log.log("Registering OBS Events...")
        reg.onSync("obs_is_initialized", () => this.obsInitialized)
        reg.onPromise("obs_initialize", () => this.initialize())
        reg.onPromise("obs_preview_init", (e, bounds) => this.initPreview(e, bounds))
        reg.onPromise("obs_preview_resize", (e, id, bounds) => this.resizePreview(id, webContentsToWindow(e.sender), bounds))
        reg.onPromise("obs_preview_destroy", (_, id) => this.removePreview(id))
        reg.onPromise("obs_start_recording", () => this.startRecording())
        reg.onPromise("obs_stop_recording", () => this.stopRecording())
        reg.onSync("obs_is_recording", () => this.isRecording())
    }
}