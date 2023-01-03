import { byOS } from '@backend/tools/operating-system';
import { RegManMain } from '@general/register/main';
import { scaleKeepRatioSpecific } from '@general/tools';
import type { InputFactory as inputType, IScene, SceneFactory as sceneType } from '@streamlabs/obs-studio-node';
import { screen } from 'electron';
import { MainLogger } from 'src/interfaces/mainLogger';
import { EAlignment, EBoundsType, SettingsCat } from 'src/types/obs/obs-enums';
import { NodeObs as typedObs } from 'src/types/obs/obs-studio-node';
import { v4 as uuid } from "uuid";
import { setOBSSetting as setSetting } from '../base';
import { importOBS } from '../tool';
import { encodeString } from '../util';
import { AudioSceneManager } from './audio';
import { getDisplayInfoFromIndex } from "./display";
import { CurrentSetting, WindowInformation } from './interfaces';

const log = MainLogger.get("Backend", "Manager", "OBS", "Scene")
export class Scene {
    private static readonly SCENE_ID = `main_scene_clipture-${uuid()}`
    private static readonly MAIN_WIN_SOURCE = "main_source"
    private static readonly MAIN_GAME_SOURCE = "main_source_game"
    private static _scene: IScene;
    private static _setting: CurrentSetting = null;

    private static SceneFactory: typeof sceneType
    private static InputFactory: typeof inputType
    private static NodeObs: typedObs

    private static refreshingDevices = false

    static async initialize() {
        const e = await importOBS()
        this.SceneFactory = e.SceneFactory
        this.InputFactory = e.InputFactory
        this.NodeObs = e.NodeObs
        log.info("Initializing scene...")

        try {
            this._scene = this.SceneFactory.fromName(this.SCENE_ID)
            this.removeAllItems()
        } catch (e) {
            this._scene = this.SceneFactory.create(this.SCENE_ID)
        }

        await AudioSceneManager.initialize()
        await AudioSceneManager.initializeAudioSources(this._scene)

        let timeoutId = null as NodeJS.Timeout
        AudioSceneManager.addDeviceUpdateListener(async () => {
            if (this.refreshingDevices)
                return

            if (timeoutId)
                clearTimeout(timeoutId)

            timeoutId = setTimeout(() => {
                timeoutId = null
                this.refreshingDevices = true
                AudioSceneManager.removeAllDevices()
                AudioSceneManager.initializeAudioSources(this._scene)
                    .then(() => this.refreshingDevices = false)
            }, 250)

        })
    }

    static async shutdown() {
        await AudioSceneManager.shutdown()
    }

    static register() {
        RegManMain.onPromise("obs_scene_info", async () => Scene.getCurrentSetting())
        RegManMain.onPromise("obs_switch_desktop", (_, monitorIndex) => this.switchDesktop(monitorIndex))
        RegManMain.onPromise("obs_switch_window", (_, options) => this.switchWindow(options))
        RegManMain.onPromise("obs_available_monitors", async () => screen.getAllDisplays().length)
        RegManMain.onSync("obs_get_record_description", () => {
            const hasScene = !!this._setting
            const { window, monitor } = this._setting ?? {}

            const recordString = monitor ? `Monitor ${monitor}` :
                window ? `[${window.executable}]: ${window.title}` : "Unknown"

            return hasScene ? `${recordString}` : "Recording blackscreen"
        })
    }

    static getCurrentSetting() {
        return this._setting
    }

    static get() {
        if (!this._scene)
            this.initialize()

        return this._scene;
    }

    static async switchDesktop(monitor: number) {
        return this.switchDesktopWindow(monitor)
    }

    static async switchDesktopWindow(monitor: number, winInfo?: WindowInformation) {
        const videoSource = this.InputFactory.create(byOS({ "win32": 'monitor_capture', "darwin": 'display_capture' }), this.MAIN_WIN_SOURCE);
        const { physicalWidth, physicalHeight } = await getDisplayInfoFromIndex(monitor)
        let oldSize = this._setting?.oldSize
        if (!oldSize) {
            oldSize = { width: physicalWidth, height: physicalHeight }
            log.silly("Setting old size", physicalWidth, physicalHeight)
        }

        const optHeight = oldSize?.height ?? physicalHeight
        const optWidth = oldSize?.width ?? physicalWidth
        const [scaledW, scaledH] = scaleKeepRatioSpecific(physicalWidth, physicalHeight, { height: optHeight, width: optWidth }, true)


        const settings = videoSource.settings;
        settings.width = scaledW
        settings.height = scaledH
        settings.monitor = monitor

        videoSource.update(settings)
        videoSource.save()


        const resolution = `${optWidth}x${optHeight}`
        setSetting(this.NodeObs, SettingsCat.Video, "Base", resolution)
        setSetting(this.NodeObs, SettingsCat.Video, "Output", resolution)

        this.removeMainSource()
        const sceneItem = this._scene.add(videoSource)

        sceneItem.bounds = { x: optWidth, y: optHeight }
        sceneItem.boundsType = EBoundsType.ScaleInner as number
        sceneItem.alignment = EAlignment.TopLeft as number


        this._setting = {
            resolution: [optWidth, optHeight],
            window: winInfo,
            monitor: monitor,
            size: {
                width: physicalWidth,
                height: physicalHeight
            },
            oldSize: oldSize
        }
        log.silly("changing resolution to", resolution, "Setting:", this._setting, "Scaled is", [ scaledW, scaledH ])
    }

    static async switchWindow(options: WindowInformation) {
        const { title, className, executable, monitorDimensions, intersectsMultiple } = options
        const windowId = [title, className, executable].map(e => encodeString(e)).join(":");

        const windowSource = this.InputFactory.create("window_capture", this.MAIN_WIN_SOURCE);
        const gameSource = this.InputFactory.create("game_capture", this.MAIN_GAME_SOURCE)

        const windowSettings = windowSource.settings;
        windowSettings["capture_mode"] = "window"
        windowSettings['compatibility'] = true;
        windowSettings['client_area'] = true;
        windowSettings["method"] = 2 // WGC Capture Method
        windowSettings['window'] = windowId;
        windowSettings['priority'] = 2 // =WINDOW_PRIORITY_CLASS_NAME

        const gameSettings = gameSource.settings;
        gameSettings['window'] = windowId;
        gameSettings['active_window'] = windowId;
        gameSettings['capture_window'] = windowId;
        gameSettings["capture_mode"] = "window"
        gameSettings["window_search_mode"] = true
        gameSettings['priority'] = 2 // =WINDOW_PRIORITY_CLASS_NAME


        windowSource.update(windowSettings)
        windowSource.save()

        gameSource.update(gameSettings)
        gameSource.save()

        const allDisplays = screen.getAllDisplays()
        const largestMonitor = allDisplays
            .reduce(((a, b) => a.size.height * a.size.width > b.size.height * b.size.width ? a : b))

        const { physicalHeight, physicalWidth } = intersectsMultiple && monitorDimensions ? {
            physicalWidth: monitorDimensions.width,
            physicalHeight: monitorDimensions.height
        } : {
            physicalHeight: largestMonitor.size.height,
            physicalWidth: largestMonitor.size.width
        }


        const resolution = `${physicalWidth}x${physicalHeight}`
        setSetting(this.NodeObs, SettingsCat.Video, "Base", resolution)
        setSetting(this.NodeObs, SettingsCat.Video, "Output", resolution)
        log.log("Switching to Window View with id ", windowId, "and resolution", resolution, "with window settings", windowSettings, "and game settings", gameSettings)

        this.removeMainSource()
        const gameItem = this._scene.add(gameSource)
        const windowItem = this._scene.add(windowSource)

        windowItem.bounds = { x: physicalWidth, y: physicalHeight }
        windowItem.boundsType = EBoundsType.ScaleInner as number
        windowItem.alignment = EAlignment.TopLeft as number

        gameItem.bounds = { x: physicalWidth, y: physicalHeight }
        gameItem.boundsType = EBoundsType.ScaleInner as number
        gameItem.alignment = EAlignment.TopLeft as number

        this._setting = {
            resolution: [physicalWidth, physicalHeight],
            window: options,
            monitor: null,
            size: {
                width: physicalWidth,
                height: physicalHeight
            }
        }
    }

    private static removeAllItems() {
        if (this._setting?.oldSize)
            this._setting.oldSize = null
        this._scene.getItems()
            .forEach(i => i.remove())
    }

    public static removeMainSource() {
        if (this._setting?.oldSize)
            this._setting.oldSize = null
        this._scene.getItems()
            .filter(i => i.source.name === this.MAIN_WIN_SOURCE || i.source.name === this.MAIN_GAME_SOURCE)
            .map(e => e.remove())
    }
}