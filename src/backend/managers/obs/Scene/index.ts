import { byOS } from '@backend/tools/operating-system';
import { RegManMain } from '@general/register/main';
import { InputFactory, IScene, ITransformInfo, SceneFactory } from '@streamlabs/obs-studio-node';
import { screen } from 'electron';
import { MainLogger } from 'src/interfaces/mainLogger';
import { EAlignment, EBoundsType, SettingsCat } from 'src/types/obs/obs-enums';
import { v4 as uuid } from "uuid";
import { setOBSSetting as setSetting } from '../base';
import { AudioSceneManager } from './audio';
import { getDisplayInfoFromIndex } from "./display";
import { WindowInformation } from './interfaces';

const log = MainLogger.get("Backend", "Manager", "OBS", "Scene")
export enum CurrentSetting {
    NONE = 0,
    DESKTOP = 1,
    WINDOW = 2
}

export type GameOptions = {
    executable: string,
    title: string,
    className: string,

}

export class Scene {
    private static readonly SCENE_ID = `main_scene_clipture-${uuid()}`
    private static readonly MAIN_SOURCE = "main_source"
    private static _scene: IScene;
    private static _setting = CurrentSetting.NONE

    static initialize() {
        log.info("Initializing scene...")
        try {
            this._scene = SceneFactory.fromName(this.SCENE_ID)
            this.removeAllItems()
        } catch (e) {
            this._scene = SceneFactory.create(this.SCENE_ID)
        }

        AudioSceneManager.initializeAudioSources(this._scene)
    }

    static register() {
        RegManMain.onPromise("obs_switch_desktop", (_, monitorIndex) => this.switchDesktop(monitorIndex))
        RegManMain.onPromise("obs_switch_game", (_, options) => this.switchGame(options))
        RegManMain.onPromise("obs_available_monitors", async () => screen.getAllDisplays().length)
        RegManMain.onPromise("obs_available_windows", (_, game) => this.getAvailableWindows(game))
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


        const resolution = `${physicalWidth}#${physicalHeight}`
        setSetting(SettingsCat.Video, "Base", resolution)
        setSetting(SettingsCat.Video, "Output", resolution)

        this.removeMainSource()
        const sceneItem = this._scene.add(videoSource)
        sceneItem.scale = { x: 1, y: 1 }
    }

    static async switchGame({ className, executable, title }: GameOptions) {
        const windowId = `${title}:${className}:${executable}`;
        log.log("Switching to Window View", windowId, InputFactory.types())
        const videoSource = InputFactory.create("window_capture", this.MAIN_SOURCE);

        const settings = videoSource.settings;
        settings["capture_mode"] = "window"
        settings['compatibility'] = true;
        settings['client_area'] = true;
        settings['window'] = windowId;
        //settings.width = 1920;
        //settings.height = 10800

        videoSource.update(settings)
        videoSource.save()


        const physicalHeight = 1080
        const physicalWidth = 1920
        const resolution = `${physicalWidth}x${physicalHeight}`
        setSetting(SettingsCat.Video, "Base", resolution)
        setSetting(SettingsCat.Video, "Output", resolution)

        this.removeMainSource()
        const sceneItem = this._scene.add(videoSource)
        sceneItem.bounds = { x: physicalWidth, y: physicalHeight }
        sceneItem.boundsType = EBoundsType.ScaleInner as number
        sceneItem.alignment = EAlignment.TopLeft as number

        console.log("t")
    }

    static async getAvailableWindows(game?: boolean) {
        log.debug("Getting available windows")
        const execa = (await import("execa")).execa
        const out = await execa(__dirname + "/assets/window_info.exe", [game ? "game" : ""])
        const stdout = out.stdout
        try {
            const res = JSON.parse(stdout) as WindowInformation[]
            log.debug(res)
            return res
        } catch {
            throw new Error(out.all)
        }
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