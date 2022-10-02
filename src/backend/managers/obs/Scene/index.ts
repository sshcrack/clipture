import { byOS } from '@backend/tools/operating-system';
import { RegManMain } from '@general/register/main';
import { MainGlobals } from '@Globals/mainGlobals';
import type { InputFactory as inputType, IScene, SceneFactory as sceneType } from '@streamlabs/obs-studio-node';
import { screen } from 'electron';
import { MainLogger } from 'src/interfaces/mainLogger';
import { EAlignment, EBoundsType, SettingsCat } from 'src/types/obs/obs-enums';
import { v4 as uuid } from "uuid";
import { setOBSSetting as setSetting } from '../base';
import { AudioSceneManager } from './audio';
import { NodeObs as typedObs } from 'src/types/obs/obs-studio-node';
import { getDisplayInfoFromIndex } from "./display";
import { CurrentSetting, WindowInformation } from './interfaces';
import { importOBS } from '../tool';

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
    }

    static register() {
        RegManMain.onPromise("obs_switch_desktop", (_, monitorIndex, manual) => this.switchDesktop(monitorIndex, manual))
        RegManMain.onPromise("obs_switch_window", (_, options, manual) => this.switchWindow(options, manual))
        RegManMain.onPromise("obs_available_monitors", async () => screen.getAllDisplays().length)
        RegManMain.onSync("obs_get_record_description", (_) => {
            const hasScene = !!this._setting
            const { window, monitor, manual } = this._setting ?? {}

            const recordString = manual ?
                "Manually recording" :
                monitor ? `Monitor ${monitor}` :
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

    static async switchDesktop(monitor: number, manual: boolean) {
        return this.switchDesktopWindow(monitor, manual)
    }

    static async switchDesktopWindow(monitor: number, manual: boolean, winInfo?: WindowInformation) {
        log.log("Switching to Desktop View with monitor", monitor)
        const videoSource = this.InputFactory.create(byOS({ "win32": 'monitor_capture', "darwin": 'display_capture' }), this.MAIN_WIN_SOURCE);
        const { physicalWidth, physicalHeight } = await getDisplayInfoFromIndex(monitor)

        const settings = videoSource.settings;
        settings.width = physicalWidth
        settings.height = physicalHeight
        settings.monitor = monitor

        videoSource.update(settings)
        videoSource.save()


        const resolution = `${physicalWidth}x${physicalHeight}`
        setSetting(this.NodeObs, SettingsCat.Video, "Base", resolution)
        setSetting(this.NodeObs, SettingsCat.Video, "Output", resolution)

        this.removeMainSource()
        const sceneItem = this._scene.add(videoSource)

        sceneItem.bounds = { x: physicalWidth, y: physicalHeight }
        sceneItem.boundsType = EBoundsType.ScaleInner as number
        sceneItem.alignment = EAlignment.TopLeft as number


        this._setting = {
            window: winInfo,
            monitor: monitor,
            manual,
            size: {
                width: physicalWidth,
                height: physicalHeight
            }
        }
    }

    static async switchWindow(options: WindowInformation, manual: boolean) {
        const { className, executable, title, monitorDimensions, intersectsMultiple } = options
        const windowId = `${title}:${className}:${executable}`;
        log.debug("Window id is", windowId)
        const windowSource = this.InputFactory.create("window_capture", this.MAIN_WIN_SOURCE);
        const gameSource = this.InputFactory.create("game_capture", this.MAIN_GAME_SOURCE)

        const windowSettings = windowSource.settings;
        windowSettings["capture_mode"] = "window"
        windowSettings['compatibility'] = true;
        windowSettings['client_area'] = true;
        windowSettings["method"] = 2 // WGC Capture Method
        windowSettings['window'] = windowId;

        const gameSettings = gameSource.settings;
        gameSettings['window'] = windowId;
        gameSettings['active_window'] = windowId;
        gameSettings['capture_window'] = windowId;
        gameSettings["capture_mode"] = "window"


        windowSource.update(windowSettings)
        windowSource.save()

        gameSource.update(gameSettings)
        gameSource.save()

        const allDisplays = screen.getAllDisplays()
        const largestMonitor = allDisplays
            .reduce(((a, b) => a.size.height * a.size.width > b.size.height * b.size.width ? a : b))

        let { physicalHeight, physicalWidth } = intersectsMultiple && monitorDimensions ? {
            physicalWidth: monitorDimensions.width,
            physicalHeight: monitorDimensions.height
        } : {
            physicalHeight: largestMonitor.size.height,
            physicalWidth: largestMonitor.size.width
        }


        const resolution = `${physicalWidth}x${physicalHeight}`
        setSetting(this.NodeObs, SettingsCat.Video, "Base", resolution)
        setSetting(this.NodeObs, SettingsCat.Video, "Output", resolution)
        log.log("Switching to Window View with id ", windowId, "and resolution", resolution)

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
            window: options,
            monitor: null,
            manual,
            size: {
                width: physicalWidth,
                height: physicalHeight
            }
        }
    }

    private static removeAllItems() {
        this._scene.getItems()
            .forEach(i => i.remove())
    }

    private static removeMainSource() {
        this._scene.getItems()
            .filter(i => i.source.name === this.MAIN_WIN_SOURCE || i.source.name === this.MAIN_GAME_SOURCE)
            .map(e => e.remove())
    }
}