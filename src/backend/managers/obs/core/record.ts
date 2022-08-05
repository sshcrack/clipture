import { VideoInfo } from '@backend/managers/clip/interface'
import { GameManager } from '@backend/managers/game'
import { GeneralGame } from '@backend/managers/game/interface'
import { notify } from '@backend/tools/notifier'
import { RegManMain } from '@general/register/main'
import { MainGlobals } from '@Globals/mainGlobals'
import { Storage } from '@Globals/storage'
import { NodeObs as notTypedOBS } from '@streamlabs/obs-studio-node'
import { BrowserWindow } from 'electron'
import fs from "fs/promises"
import path from 'path'
import { MainLogger } from 'src/interfaces/mainLogger'
import { SettingsCat } from 'src/types/obs/obs-enums'
import { NodeObs } from 'src/types/obs/obs-studio-node'
import { Scene } from '../Scene'
import { DetectableGame, WindowInformation } from '../Scene/interfaces'
import { getWindowInfoId, isDetectableGameInfo, isWindowInfoSame } from './tools'

const reg = RegManMain
const NodeObs: NodeObs = notTypedOBS
const log = MainLogger.get("Backend", "Managers", "OBS", "Core", "Record")

type CurrentType = Omit<VideoInfo, "duration"> & {
    videoPath: string | null,
    currentInfoPath: string | null
}

export type OutCurrentType = Omit<CurrentType, "gameId"> & {
    game: GeneralGame
}

export class RecordManager {
    private recording = false;
    private current = {
        gameId: null,
        videoPath: null,
        currentInfoPath: null
    } as CurrentType
    static instance: RecordManager = null;
    private registeredAutomatic = false;
    private manualControlled = false;
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
            const { currentInfoPath, gameId, videoPath } = this.current
            const duration = await getDuration(videoPath)
            await fs.writeFile(currentInfoPath, JSON.stringify({
                duration,
                gameId
            } as VideoInfo, null, 2))
        }
        this.recording = false
        this.manualControlled = manual
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
    }

    public async shutdown() {
        const clipPath = Storage.get("clip_path")
        const infoPath = path.join(clipPath, "window_info.json")

        await fs.writeFile(infoPath, JSON.stringify(Array.from(this.windowInformation.entries())))
        this.stopRecording()
    }
}

function processRunning(pid: number) {
    try {
        process.kill(pid, 0)
        return true
    } catch {
        return false
    }
}

function sleepSync(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    });
}

async function getDuration(inputPath: string) {
    const execa = (await import("execa")).execa
    const res = await execa(MainGlobals.ffprobeExe, ["-i", inputPath, "-show_format"])
    const numberRes = res
        .stdout
        ?.split("\n")
        ?.find(e => e.includes("duration"))
        ?.split("=")
        ?.shift()

    if (!numberRes)
        throw new Error(`Could not get duration with ffprobe at ${MainGlobals.ffprobeExe} with clip ${inputPath}`)
    return parseFloat(numberRes)
}