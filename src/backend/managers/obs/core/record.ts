import { VideoInfo } from '@backend/managers/clip/interface'
import { GameManager } from '@backend/managers/game'
import { BookmarkManager } from "@backend/managers/obs/bookmark"
import { Prerequisites } from '@backend/managers/prerequisites'
import { notify } from '@backend/tools/notifier'
import { RegManMain } from '@general/register/main'
import { MainGlobals } from '@Globals/mainGlobals'
import { Storage } from '@Globals/storage'
import { BrowserWindow } from 'electron'
import fs from "fs/promises"
import path from 'path'
import sound from "sound-play"
import { MainLogger } from 'src/interfaces/mainLogger'
import { EOBSOutputSignal, SettingsCat } from 'src/types/obs/obs-enums'
import { NodeObs as typedObs } from 'src/types/obs/obs-studio-node'
import { Scene } from '../Scene'
import { DetectableGame, WindowInformation } from '../Scene/interfaces'
import { SignalsManager } from '../Signals'
import { getAvailableGame, listVideos, processRunning, waitForVideo } from "./backend_only_tools"
import { CurrentType, OutCurrentType } from "./interface"
import { getWindowInfoId } from './tools'

const reg = RegManMain
const log = MainLogger.get("Backend", "Managers", "OBS", "Core", "Record")
const { obsRequirePath } = MainGlobals
export class RecordManager {
    private recording = false;
    private NodeObs: typedObs = null
    private current = {
        gameId: null,
        videoPath: null,
        currentInfoPath: null,
        bookmarks: [] as number[]
    } as CurrentType
    static instance: RecordManager = null;
    private recordingInitializing = false
    private initialized = false;
    private manualControlled = false;
    private recordTimer: number = undefined;
    private windowInformation = new Map<string, WindowInformation>()
    private listeners = [] as ((isRecording: boolean) => unknown)[]

    public async getCurrent() {
        const detectable = await GameManager.getDetectableGames()
        const { gameId, ...left } = this.current ?? {}
        const detectableGame = detectable.find(e => e.id === gameId)
        const winInfo = this.windowInformation.get(gameId)
        return {
            game: detectableGame ? {
                type: "detectable",
                game: detectable
            } : winInfo ? {
                type: "window",
                game: winInfo
            } : null,
            ...left
        } as OutCurrentType
    }

    constructor() {
        if (RecordManager.instance)
            throw new Error("Record class cannot be instantiated twice.")

        RecordManager.instance = this;
        this.register()
    }

    public getWindowInfo() {
        return this.windowInformation
    }

    public getRecordStart() {
        return this.recordTimer
    }

    public async initialize() {
        if (this.initialized)
            return

        log.info("Registering automatic recording")
        const clipPath = Storage.get("clip_path")
        const infoPath = path.join(clipPath, "window_info.json")
        let entries = [] as [string, WindowInformation][]
        try {
            entries = JSON.parse(await fs.readFile(infoPath, "utf-8").catch(() => "[]"))
        } catch (e) {
            log.warn("Could not parse info path")
        }

        this.windowInformation = new Map(entries)


        log.debug("Registering automatic recording stop")
        setInterval(() => {
            const { window, monitor } = Scene.getCurrentSetting() ?? {}
            if (window && this.isRecording()) {
                const isRunning = processRunning(window.pid)
                if (!isRunning && !this.manualControlled) {
                    this.stopRecording()
                    notify({
                        title: "Recording stopped",
                        message: `${window.title ?? "Monitor " + monitor} has been recorded successfully`
                    })
                }
            }
        }, 2500)

        GameManager.addUpdateListener(e => this.onGameUpdate(e))
        const curr = await GameManager.getAvailableWindows(true)
        this.onGameUpdate(curr)

        const obsInstalled = await Prerequisites.validateOBS()
        if(!obsInstalled)
            throw new Error("OBS-Installation is not valid.")

        this.NodeObs = (await import(obsRequirePath)).NodeObs
        this.initialized = true
    }

    public async startRecording(manual = false, discordGameInfo: DetectableGame = null, windowInfo: WindowInformation = null) {
        if (this.recording) {
            log.debug("Tried to record even though already recording")
            return
        }

        if (!this.initialized)
            return log.warn("Could not start recording, not initialized")

        if(this.recordingInitializing)
            return log.warn("Could not start record, another instance is already starting")

        this.recordingInitializing = true
        this.manualControlled = manual;
        const recordPath = this.NodeObs.OBS_settings_getSettings(SettingsCat.Output)
            .data
            .find(e => e.nameSubCategory === "Recording")
            .parameters
            .find(e => e.name === "RecFilePath")
            .currentValue as string

        log.info("Starting to record to path", recordPath)
        if (!recordPath)
            log.warn("No Record Path set")
        else
            await fs.stat(recordPath).catch(() => fs.mkdir(recordPath))

        const currVideos = await listVideos(recordPath)
        this.NodeObs.OBS_service_startRecording()

        const signal = await SignalsManager.getNextSignalInfo();
        if (signal.signal === EOBSOutputSignal.Stop)
            throw new Error("Could not start recording.")

        this.recordTimer = Date.now()

        const videoName = await waitForVideo(recordPath, currVideos, () => this.isRecording() || this.recordingInitializing)
        const videoPath = recordPath + "/" + videoName
        const infoPathAvailable = recordPath && videoName
        if (!infoPathAvailable)
            log.warn("Video Path could not be obtained")

        const windowId = getWindowInfoId(windowInfo)
        if (!discordGameInfo?.id)
            this.windowInformation.set(windowId, windowInfo)

        this.current = {
            currentInfoPath: infoPathAvailable ? videoPath + ".json" : null,
            gameId: discordGameInfo?.id ?? windowId,
            videoPath: infoPathAvailable ? videoPath : null,
            bookmarks: []
        }

        this.recordingInitializing = false
        this.recording = true
        BrowserWindow.getAllWindows().forEach(e => e.setOverlayIcon(MainGlobals.dotIconNativeImage, "Recording..."))
        RegManMain.send("obs_record_change", true)
        this.listeners.map(e => e(true))
    }

    public async stopRecording(manual = false) {
        if (!this.recording)
            return

        if (!this.initialized)
            return log.warn("Could not stop recording, not initialized")

        log.info("Stopped recording")
        this.NodeObs.OBS_service_stopRecording()
        if (this.current?.currentInfoPath) {
            const { currentInfoPath, gameId, bookmarks } = this.current
            await fs.writeFile(currentInfoPath, JSON.stringify({
                gameId,
                bookmarks
            } as VideoInfo, null, 2))
        }
        this.recording = false
        this.recordTimer = undefined
        this.manualControlled = manual
        this.current = {
            gameId: null,
            videoPath: null,
            currentInfoPath: null,
            bookmarks: []
        }

        RegManMain.send("obs_record_change", false)
        this.listeners.map(e => e(false))
        BrowserWindow.getAllWindows().forEach(e => e.setOverlayIcon(null, ""))
    }

    public addRecordListener(func: (isRecording: boolean) => unknown) {
        this.listeners.push(func)

        return () => {
            const index = this.listeners.indexOf(func)
            if(index === -1)
                return
            this.listeners.splice(index, 1)
        }
    }

    public isRecording() {
        return this.recording;
    }

    public getCurrTime() {
        return this.recordTimer && Date.now() - this.recordTimer
    }

    private register() {
        reg.onPromise("obs_start_recording", (_, e) => this.startRecording(e))
        reg.onPromise("obs_stop_recording", (_, e) => this.stopRecording(e))
        reg.onSync("obs_is_recording", () => this.isRecording())
        reg.onPromise("obs_get_current", () => this.getCurrent())
        reg.onPromise("obs_record_time", async () => this.getCurrTime())
        this.registerHotkey()
    }

    public async shutdown() {
        const clipPath = Storage.get("clip_path")
        const infoPath = path.join(clipPath, "window_info.json")

        await fs.writeFile(infoPath, JSON.stringify(Array.from(this.windowInformation.entries())))
        await this.stopRecording()
    }

    private registerHotkey() {
        BookmarkManager.addHotkeyHook(() => {
            if (!this.isRecording() || !this.current)
                return

            const currTime = this.getCurrTime()
            if (!this.current?.bookmarks)
                this.current.bookmarks = []


            log.info("New Bookmark at time", currTime, "added")
            this.current.bookmarks.push(currTime)
            sound.play(path.resolve(MainGlobals.bookmarkedSound))
        })
    }

    public async onGameUpdate(info: WindowInformation[]) {
        const available = await getAvailableGame(info)
        if(!available)
            return
        const { diff, winInfo, game } = available ?? {}

        log.info("Game is diff", diff, "manual", this.manualControlled,
        "game", winInfo, "curr", Scene.getCurrentSetting()?.window)
        if (winInfo && (diff || !Scene.getCurrentSetting()?.window) && !this.manualControlled) {
            await Scene.switchWindow(winInfo, false)
            if (this.isRecording())
                await this.stopRecording()
        }

        if (GameManager.winInfoExcluded(winInfo))
            return

        log.debug("Trying to record if not recording scene has window:", Scene.getCurrentSetting()?.window)
        if (!this.isRecording() && Scene.getCurrentSetting()?.window && !this.manualControlled) {
            this.startRecording(false, game, winInfo).then(() =>
                notify({
                    title: "Recording started",
                    message: `Recording started for ${winInfo?.productName ?? winInfo?.title ?? winInfo.executable}`
                })
            )
        }
    }
}
