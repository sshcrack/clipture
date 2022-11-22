import { AuthManager } from '@backend/managers/auth'
import { VideoInfo } from '@backend/managers/clip/interface'
import { GameManager } from '@backend/managers/game'
import { BookmarkManager } from "@backend/managers/obs/bookmark"
import { Prerequisites } from '@backend/managers/prerequisites'
import { RegManMain } from '@general/register/main'
import { getAddRemoveListener } from '@general/tools/listener'
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
import { importOBS } from '../tool'
import { clickableNotification, getAvailableGame, listVideos, processRunning, waitForVideo } from "./backend_only_tools"
import { CurrentType, OutCurrentType } from "./interface"
import { getWindowInfoId } from './tools'

const reg = RegManMain
const log = MainLogger.get("Backend", "Managers", "OBS", "Record")

type ListenerType = (isRecording: boolean) => unknown

export class RecordManager {
    private recording = false;
    private recordingInitializing = false;
    private stopInitializing = false;
    private NodeObs: typedObs = null
    private recordProm: Promise<unknown>
    private current = {
        gameId: null,
        videoPath: null,
        currentInfoPath: null,
        currentIcoPath: null,
        bookmarks: [] as number[]
    } as CurrentType
    static instance: RecordManager = null;
    private initialized = false;
    private automaticRecord = true;
    private disabled = false
    private recordTimer: number = undefined;
    private windowInformation = new Map<string, WindowInformation>()
    private listeners = [] as ListenerType[]

    public async getCurrent() {
        const detectable = await GameManager.getDetectableGames()
        const { gameId, videoPath, ...left } = this.current ?? {}
        const detectableGame = detectable?.find(e => e.id === gameId)
        const winInfo = this.windowInformation.get(gameId)
        const curr = {
            ...left,
            game: detectableGame ? {
                type: "detectable",
                game: detectableGame
            } : (winInfo ? {
                type: "window",
                game: winInfo
            } : null),
            videoName: videoPath && path.basename(videoPath)
        } as OutCurrentType

        console.log("Current is", curr)
        return curr
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

    public async isAutomaticRecording() {
        return this.automaticRecord && (!AuthManager.isOffline() || (await GameManager.hasCache()))
    }

    public isDesktopView() {
        return (Storage.get("obs").capture_method ?? "window") === "desktop"
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
        this.automaticRecord = Storage.get("automatic_record") ?? true


        log.debug("Registering automatic recording stop")
        setInterval(async () => {
            const { window, monitor } = Scene.getCurrentSetting() ?? {}
            if (window && this.isRecording()) {
                const isRunning = processRunning(window.pid)
                const recordingAutomatically = await this.isAutomaticRecording()
                if (!isRunning && recordingAutomatically) {
                    this.stopRecording()
                        .then(() =>
                            clickableNotification({
                                title: "Recording stopped",
                                body: `${window.title ?? "Monitor " + monitor} has been recorded successfully`,
                                silent: true
                            }, () => MainGlobals.window.show()).show()
                        )
                        .catch(e => {
                            if (e === "init_fail")
                                return log.silly("Init fail stop.")

                            log.error("Record stop Err", e)
                            throw e
                        })
                }
            }
        }, 2500)

        GameManager.addUpdateListener(e => this.onGameUpdate(e))
        const curr = await GameManager.getAvailableWindows(true)
        this.onGameUpdate(curr)

        const obsInstalled = await Prerequisites.validateOBS()
        if (!obsInstalled)
            throw new Error("OBS-Installation is not valid.")

        this.NodeObs = (await importOBS()).NodeObs
        this.initialized = true
    }

    public async startRecording(discordGameInfo: DetectableGame = null, windowInfo: WindowInformation = null) {
        if (this.disabled) {
            log.warn("Tried to start recording, but record manager is disabled.")
            return
        }

        if (this.recording) {
            log.debug("Tried to record even though already recording")
            return
        }

        if (!this.initialized)
            return log.warn("Could not start recording, not initialized")

        if (this.recordingInitializing || this.stopInitializing)
            throw new Error("init_fail")

        this.recordingInitializing = true
        const prom = (async () => {
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
            let started = false
            for (let i = 0; i < 5; i++) {
                log.debug("Trying to start...")
                this.NodeObs.OBS_service_startRecording()
                const signal = await SignalsManager.getNextSignalInfo().catch(() => { log.warn("Timeout signal"); return { signal: EOBSOutputSignal.Start } });
                if (signal.signal === EOBSOutputSignal.Stop) {
                    log.warn("Could not start recording: ", signal, "trying again...")
                    continue;
                }

                started = true
                break;
            }

            if (!started)
                throw new Error("Could not start recording.")


            const videoName = await waitForVideo(recordPath, currVideos, () => this.isRecording() || this.recordingInitializing)
            this.recordTimer = Date.now()
            const videoPath = (recordPath + "/" + videoName).split("\\").join("/")
            const infoPathAvailable = recordPath && videoName
            if (!infoPathAvailable)
                log.warn("Video Path could not be obtained")

            const windowId = windowInfo && getWindowInfoId(windowInfo)

            this.current = {
                currentInfoPath: infoPathAvailable ? videoPath + ".json" : null,
                gameId: discordGameInfo?.id ?? windowId,
                videoPath: infoPathAvailable ? videoPath : null,
                bookmarks: []
            }

            if (infoPathAvailable) {
                log.debug("Saving icon...")
                const tempPath = windowInfo?.pid && await GameManager.getIconPath(windowInfo?.pid)
                const icoRoot = (recordPath + "/" + path.basename(videoName, path.extname(videoName))).split("\\").join("/")
                const icoPath = icoRoot + ".ico"

                if (tempPath && icoPath) {
                    await fs.copyFile(tempPath, icoPath)
                    fs.unlink(tempPath)
                }

                const { currentInfoPath, gameId } = this.current
                await fs.writeFile(currentInfoPath, JSON.stringify({
                    gameId
                } as VideoInfo, null, 2))
            }

            log.info("Record current is: ", this.current)
            BrowserWindow.getAllWindows().forEach(e => e.setOverlayIcon(MainGlobals.dotIconNativeImage, "Recording..."))
            RegManMain.send("obs_record_change", true)
            this.listeners.map(e => e(true))

            if (!discordGameInfo?.id && windowId) {
                this.windowInformation.set(windowId, {
                    ...windowInfo,
                    arguments: ["censored"]
                })
                await this.save()
            }
            this.recording = true
        })()


        this.recordProm = prom
        return prom
            .catch((e: unknown) => {
                this.recording = false
                throw e
            })
            .finally(() => {
                this.recordProm = null
                this.recordingInitializing = false
            })
    }

    public async stopRecording() {
        if (!this.recording)
            return

        if (!this.initialized)
            return log.warn("Could not stop recording, not initialized")

        if (this.stopInitializing && !this.recordingInitializing)
            throw new Error("init_fail")

        if (this.recordProm) {
            log.info("Waiting for recording prom...")
            await this.recordProm
        }

        log.info("Stopped recording")
        this.stopInitializing = true
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
        this.current = {
            gameId: null,
            videoPath: null,
            currentInfoPath: null,
            bookmarks: []
        }

        this.listeners.map(e => e(false))
        RegManMain.send("obs_record_change", false)
        BrowserWindow.getAllWindows().forEach(e => e.setOverlayIcon(null, ""))
        Scene.removeMainSource()
        this.stopInitializing = false
    }

    public addRecordListener(func: ListenerType) {
        return getAddRemoveListener(func, this.listeners)
    }

    public isRecording() {
        return this.recording;
    }

    public getCurrTime() {
        return this.recordTimer && Date.now() - this.recordTimer
    }

    private register() {
        reg.onPromise("obs_start_recording", () => this.startRecording())
        reg.onPromise("obs_stop_recording", () => this.stopRecording())
        reg.onSync("obs_is_recording", () => this.isRecording())
        reg.onPromise("obs_get_current", () => this.getCurrent())
        reg.onPromise("obs_record_time", async () => this.getCurrTime())
        reg.onPromise("obs_game_refresh", async () => {
            const curr = await GameManager.getAvailableWindows(true)
            this.onGameUpdate(curr)
        })
        this.registerHotkey()
    }

    public async save() {
        const clipPath = Storage.get("clip_path")
        const infoPath = path.join(clipPath, "window_info.json")

        await fs.writeFile(infoPath, JSON.stringify(Array.from(this.windowInformation.entries())))
    }

    public async shutdown() {
        await this.save()
        await this.stopRecording()
    }

    private registerHotkey() {
        log.info("Hotkey Hook registered.")
        BookmarkManager.addHotkeyHook(() => {
            log.silly("Recording: ", this.isRecording())
            if (!this.isRecording())
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
        if (!(await this.isAutomaticRecording()))
            return

        const available = await getAvailableGame(info).catch(() => null)
        if (!available)
            return

        const { diff, winInfo, game, gameDiff } = available ?? {}
        if (winInfo && (diff || !Scene.getCurrentSetting()?.window)) {
            if (this.isDesktopView() && winInfo.monitorDimensions)
                await Scene.switchDesktopWindow(winInfo.monitorDimensions.index, winInfo)
            else
                await Scene.switchWindow(winInfo)

            if (this.isRecording() && gameDiff)
                await this.stopRecording()
        }

        if (GameManager.winInfoExcluded(winInfo))
            return

        if (!this.isRecording() && Scene.getCurrentSetting()?.window) {
            log.debug("Recording window:", {
                ...(Scene.getCurrentSetting()?.window ?? {}),
                arguments: ["censored"]
            } as WindowInformation, "Recording", this.isRecording())
            this.startRecording(game, winInfo).then(() =>
                clickableNotification({
                    title: "Recording started",
                    body: `Recording started for ${winInfo?.productName ?? winInfo?.title ?? winInfo.executable}`,
                    silent: true
                }, () => MainGlobals.window.show()).show()
            )
                .catch(e => {
                    if (e?.message === "init_fail")
                        return log.silly("Init fail start")

                    log.error("Could not start recording", e)
                    throw e
                })
        }
    }

    public setAutomaticRecord(record: boolean) {
        Storage.set("automatic_record", record)
        this.automaticRecord = record
    }

    public disable() {
        this.disabled = true
    }

    public enable() {
        this.disabled = false
    }
}
