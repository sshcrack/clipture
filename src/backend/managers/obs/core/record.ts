import { VideoInfo } from '@backend/managers/clip/interface'
import { GameManager } from '@backend/managers/game'
import { GeneralGame } from '@backend/managers/game/interface'
import { notify } from '@backend/tools/notifier'
import { RegManMain } from '@general/register/main'
import { MainGlobals } from '@Globals/mainGlobals'
import { BookmarkManager} from "@backend/managers/obs/bookmark"
import { Storage } from '@Globals/storage'
import { NodeObs as notTypedOBS } from '@streamlabs/obs-studio-node'
import sound from "sound-play"
import { BrowserWindow } from 'electron'
import fs from "fs/promises"
import path from 'path'
import { OutCurrentType, CurrentType } from "./interface"
import { MainLogger } from 'src/interfaces/mainLogger'
import { EOBSOutputSignal, SettingsCat } from 'src/types/obs/obs-enums'
import { NodeObs } from 'src/types/obs/obs-studio-node'
import { Scene } from '../Scene'
import { DetectableGame, WindowInformation } from '../Scene/interfaces'
import { SignalsManager } from '../Signals'
import { getDuration, processRunning } from "./backend_only_tools"
import { getWindowInfoId, isDetectableGameInfo, isWindowInfoSame, sleepSync } from './tools'

const reg = RegManMain
const NodeObs: NodeObs = notTypedOBS
const log = MainLogger.get("Backend", "Managers", "OBS", "Core", "Record")

export class RecordManager {
    private recording = false;
    private current = {
        gameId: null,
        videoPath: null,
        currentInfoPath: null,
        bookmarks: [] as number[]
    } as CurrentType
    static instance: RecordManager = null;
    private registeredAutomatic = false;
    private manualControlled = false;
    private recordTimer: number = undefined;
    private windowInformation = new Map<string, WindowInformation>()

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

    public async initialize() {
        if (this.registeredAutomatic)
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

        const onNewInfo = async (info: WindowInformation[]) => {
            const detectableGames = await GameManager.getDetectableGames()
            const toExclude = GameManager.getExcludeList()
            const toInclude = await GameManager.getIncludeList()

            const areSameInfo = (oldInfo: WindowInformation, winInfo: WindowInformation) => {
                const oldInfoReduced = {
                    ...oldInfo,
                    focused: false
                }

                const winInfoReduced = {
                    ...winInfo,
                    focused: false
                }

                const srt = (obj: any) => JSON.stringify(obj)
                const x = srt(oldInfoReduced)
                const y = srt(winInfoReduced)

                return x === y
            }


            const matchingGames = info.filter(winInfo => {
                return detectableGames.some(detecGame => isDetectableGameInfo(detecGame, winInfo))
            }).concat(info.filter(winInfo => {
                return toInclude.some(e => {
                    if (e.type === "detectable")
                        return isDetectableGameInfo(e.game, winInfo)
                    return isWindowInfoSame(e.game, winInfo)
                })
            }))

            if (matchingGames.length === 0)
                return

            const isExcluded = (e: WindowInformation) => toExclude.some(x => {
                if (x.type === "window")
                    return JSON.stringify(x.game) === JSON.stringify(e)

                return isDetectableGameInfo(x.game, e)
            })

            const gameToRecord = matchingGames.find(e => e.focused) ?? matchingGames[0]
            const game = detectableGames.find(e => isDetectableGameInfo(e, gameToRecord))

            const diffGame = !areSameInfo(gameToRecord, Scene.getCurrentSetting()?.window)
            log.info("Game is diff", diffGame, "manual", this.manualControlled, "game", gameToRecord, "curr", Scene.getCurrentSetting()?.window)
            if (gameToRecord && (diffGame || !Scene.getCurrentSetting()?.window) && !this.manualControlled) {
                await Scene.switchWindow(gameToRecord, false)
                if (this.isRecording())
                    await this.stopRecording()
            }

            if (isExcluded(gameToRecord))
                return

            log.debug("Trying to record if not recording scene has window:", Scene.getCurrentSetting()?.window)
            if (!this.isRecording() && Scene.getCurrentSetting()?.window && !this.manualControlled) {
                this.startRecording(false, game, gameToRecord).then(() =>
                    notify({
                        title: "Recording started",
                        message: `Recording started for ${gameToRecord?.productName ?? gameToRecord?.title ?? gameToRecord.executable}`
                    })
                )
            }
        }

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

        GameManager.addUpdateListener(e => onNewInfo(e))
        const curr = await GameManager.getAvailableWindows(true)
        onNewInfo(curr)

        this.registeredAutomatic = true
    }

    public async startRecording(manual = false, discordGameInfo: DetectableGame = null, windowInfo: WindowInformation = null) {
        if (this.recording) {
            log.debug("Tried to record even though already recording")
            return
        }

        this.manualControlled = manual;
        const recordPath = NodeObs.OBS_settings_getSettings(SettingsCat.Output)
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

        const listVideos = () => fs.readdir(recordPath).then(e => e.filter(e => !e.endsWith(".json")))
        const currVideos = await listVideos()
        NodeObs.OBS_service_startRecording()

        const signal = await SignalsManager.getNextSignalInfo();
        if(signal.signal === EOBSOutputSignal.Stop)
            throw new Error("Could not start recording.")

        this.recordTimer = Date.now()
        let videoName = null
        for (let i = 0; i < 1000; i++) {
            const newVideos = await listVideos()
            if (newVideos.length > currVideos.length) {
                videoName = newVideos.find(e => currVideos.indexOf(e) === -1)
                break
            }

            await sleepSync(50)
            if (!this.isRecording())
                break;
            if (i % 10 === 0)
                log.silly("Waiting for new video...")
        }

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

        this.recording = true
        BrowserWindow.getAllWindows().forEach(e => e.setOverlayIcon(MainGlobals.dotIconNativeImage, "Recording..."))
        RegManMain.send("obs_record_change", true)
    }

    public async stopRecording(manual = false) {
        if (!this.recording)
            return

        log.info("Stopped recording")
        NodeObs.OBS_service_stopRecording()
        if (this.current?.currentInfoPath) {
            const { currentInfoPath, gameId, videoPath, bookmarks } = this.current
            const duration = await getDuration(videoPath)
            await fs.writeFile(currentInfoPath, JSON.stringify({
                duration,
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
        BrowserWindow.getAllWindows().forEach(e => e.setOverlayIcon(null, ""))
    }

    public isRecording() {
        return this.recording;
    }

    private register() {
        reg.onPromise("obs_start_recording", (_, e) => this.startRecording(e))
        reg.onPromise("obs_stop_recording", (_, e) => this.stopRecording(e))
        reg.onSync("obs_is_recording", () => this.isRecording())
        reg.onPromise("obs_get_current", () => this.getCurrent())
        reg.onPromise("obs_record_time", async () => this.recordTimer && Date.now() - this.recordTimer)
        this.registerHotkey()
    }

    public async shutdown() {
        const clipPath = Storage.get("clip_path")
        const infoPath = path.join(clipPath, "window_info.json")

        await fs.writeFile(infoPath, JSON.stringify(Array.from(this.windowInformation.entries())))
        await this.stopRecording()
    }

    public registerHotkey() {
        BookmarkManager.addHotkeyHook(() => {
            if(!this.isRecording() || !this.current)
                return

            const currTime = Date.now() - this.recordTimer
            if(!this.current?.bookmarks)
                this.current.bookmarks = []


            log.info("New Bookmark at time", currTime, "added")
            this.current.bookmarks.push(currTime)
            sound.play(MainGlobals.bookmarkedSound)
        })
    }
}
