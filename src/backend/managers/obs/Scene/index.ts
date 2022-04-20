import { ProcessManager } from '@backend/managers/process';
import { byOS, getOS } from '@backend/tools/operating-system';
import { UseToastOptions } from '@chakra-ui/react';
import { RegManMain } from '@general/register/main';
import { Globals } from '@Globals/index';
import { InputFactory, IScene, SceneFactory } from '@streamlabs/obs-studio-node';
import { screen } from 'electron';
import got from 'got/dist/source';
import { MainLogger } from 'src/interfaces/mainLogger';
import { EAlignment, EBoundsType, SettingsCat } from 'src/types/obs/obs-enums';
import { v4 as uuid } from "uuid";
import { setOBSSetting as setSetting } from '../base';
import { AudioSceneManager } from './audio';
import { getDisplayInfoFromIndex } from "./display";
import { CurrentSetting, DetectableGame, WindowOptions } from './interfaces';

const log = MainLogger.get("Backend", "Manager", "OBS", "Scene")

export class Scene {
    private static readonly SCENE_ID = `main_scene_clipture-${uuid()}`
    private static readonly MAIN_SOURCE = "main_source"
    private static _scene: IScene;
    private static detectableGames: DetectableGame[] = []
    private static _setting: CurrentSetting = null;

    static async initialize() {
        log.info("Initializing scene...")
        try {
            this._scene = SceneFactory.fromName(this.SCENE_ID)
            this.removeAllItems()
        } catch (e) {
            this._scene = SceneFactory.create(this.SCENE_ID)
        }

        const res = await got(Globals.gameUrl)
            .then(e => JSON.parse(e.body))
            .catch(e => {
                log.warn("Could not fetch game info from url", Globals.gameUrl, e)
                RegManMain.send("toast_show", {
                    title: "Warning",
                    description: "Could not get detectable games, please check your internet connection or hit record manually",
                    duration: 25000
                } as UseToastOptions)
                return undefined
            })

        this.detectableGames = res ?? []

        AudioSceneManager.initializeAudioSources(this._scene)
    }

    static register() {
        RegManMain.onPromise("obs_switch_desktop", (_, monitorIndex) => this.switchDesktop(monitorIndex))
        RegManMain.onPromise("obs_switch_window", (_, options) => this.switchWindow(options))
        RegManMain.onPromise("obs_available_monitors", async () => screen.getAllDisplays().length)
        RegManMain.onSync("obs_get_record_description", (_) => {
            const hasScene = !!this._setting
            const { window, monitor } = this._setting ?? {}

            const recordString = monitor ? `Monitor ${monitor}` : `[${window.executable}]: ${window.title}`
            return hasScene ? `${recordString}` : "No game detected"
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
        log.log("Switching to Desktop View with monitor", monitor)
        const videoSource = InputFactory.create(byOS({ "win32": 'monitor_capture', "darwin": 'display_capture' }), this.MAIN_SOURCE);
        const { physicalWidth, physicalHeight } = await getDisplayInfoFromIndex(monitor)

        const settings = videoSource.settings;
        settings.width = physicalWidth
        settings.height = physicalHeight
        settings.monitor = monitor

        videoSource.update(settings)
        videoSource.save()


        const resolution = `${physicalWidth}x${physicalHeight}`
        setSetting(SettingsCat.Video, "Base", resolution)
        setSetting(SettingsCat.Video, "Output", resolution)

        this.removeMainSource()
        const sceneItem = this._scene.add(videoSource)

        sceneItem.bounds = { x: physicalWidth, y: physicalHeight }
        sceneItem.boundsType = EBoundsType.ScaleInner as number
        sceneItem.alignment = EAlignment.TopLeft as number
    }

    static async switchWindow({ className, executable, title, monitorDimensions, intersectsMultiple }: WindowOptions) {
        const windowId = `${title}:${className}:${executable}`;
        const videoSource = InputFactory.create("window_capture", this.MAIN_SOURCE);

        const settings = videoSource.settings;
        settings["capture_mode"] = "window"
        settings['compatibility'] = true;
        settings['client_area'] = true;
        settings['window'] = windowId;

        videoSource.update(settings)
        videoSource.save()


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
        setSetting(SettingsCat.Video, "Base", resolution)
        setSetting(SettingsCat.Video, "Output", resolution)
        log.log("Switching to Window View with id ", windowId, "and resolution", resolution)

        this.removeMainSource()
        const sceneItem = this._scene.add(videoSource)

        sceneItem.bounds = { x: physicalWidth, y: physicalHeight }
        sceneItem.boundsType = EBoundsType.ScaleInner as number
        sceneItem.alignment = EAlignment.TopLeft as number
    }

    private static removeAllItems() {
        this._scene.getItems()
            .forEach(i => i.remove())
    }

    private static removeMainSource() {
        this._scene.getItems()
            .filter(i => i.source.name === this.MAIN_SOURCE)
            .map(e => e.remove())
    }
}