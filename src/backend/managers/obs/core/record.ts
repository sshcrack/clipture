import { VideoInfo } from '@backend/managers/clip/interface'
import { ProcessManager } from '@backend/managers/process'
import { notify } from '@backend/tools/notifier'
import { getOS } from '@backend/tools/operating-system'
import { UseToastOptions } from '@chakra-ui/react'
import { RegManMain } from '@general/register/main'
import { MainGlobals } from '@Globals/mainGlobals'
import { NodeObs as notTypedOBS } from '@streamlabs/obs-studio-node'
import { app, BrowserWindow } from 'electron'
import fs from "fs/promises"
import got from 'got/dist/source'
import { MainLogger } from 'src/interfaces/mainLogger'
import { SettingsCat } from 'src/types/obs/obs-enums'
import { NodeObs } from 'src/types/obs/obs-studio-node'
import { Scene } from '../Scene'
import { DetectableGame, WindowInformation } from '../Scene/interfaces'

const reg = RegManMain
const NodeObs: NodeObs = notTypedOBS
const log = MainLogger.get("Backend", "Managers", "OBS", "Core", "Record")

export class RecordManager {
    private recording = false;
    private detectableGames: DetectableGame[] = null
    private current = {
        game: null,
        videoPath: null,
        currentInfoPath: null
    } as Omit<VideoInfo, "duration"> & {
        videoPath: string | null,
        currentInfoPath: string | null
    }
    static instance: RecordManager = null;
    private registeredAutomatic = false;
    private manualControlled = false;

    public getCurrent() {
        return this.current
    }

    constructor() {
        if (RecordManager.instance)
            throw new Error("Record class cannot be instantiated twice.")

        RecordManager.instance = this;
        this.register()
    }

    public getDetectableGames(showToast = true) {
        return got(MainGlobals.gameUrl).then(e => JSON.parse(e.body))
            .catch(e => {
                log.warn("Could not fetch detectable games", e)
                if (showToast)
                    RegManMain.send("toast_show", {
                        title: "Warning",
                        description: "Could not fetch detectable games, please check your internet connection or click the button to manually start recording.",
                        status: "warning"
                    } as UseToastOptions)
                return []
            })
    }

    public async initialize() {
        if (this.registeredAutomatic)
            return

        log.info("Registering automatic recording")
        const onNewInfo = async (info: WindowInformation[]) => {
            const os = getOS()
            this.detectableGames = this.detectableGames ?? await this.getDetectableGames()

            const areSame = (detecGame: DetectableGame, winInfo: WindowInformation) => detecGame?.executables?.some(exe => winInfo?.full_exe?.toLowerCase()?.endsWith(exe?.name?.toLowerCase()) && exe?.os === os)
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
                return this.detectableGames.some(detecGame => areSame(detecGame, winInfo))
            })

            if (matchingGames.length === 0)
                return

            const gameToRecord = matchingGames.find(e => e.focused) ?? matchingGames[0]
            const game = this.detectableGames.find(e => areSame(e, gameToRecord))

            const diffGame = !areSameInfo(gameToRecord, Scene.getCurrentSetting()?.window)
            log.info("Game is diff", diffGame, "manual", this.manualControlled, "game", gameToRecord, "curr", Scene.getCurrentSetting()?.window)
            if (gameToRecord && (diffGame || !Scene.getCurrentSetting()?.window) && !this.manualControlled) {
                await Scene.switchWindow(gameToRecord, false)
                if (this.isRecording())
                    await this.stopRecording()
            }


            log.debug("Trying to record if not recording scene has window:", Scene.getCurrentSetting()?.window)
            if (!this.isRecording() && Scene.getCurrentSetting()?.window && !this.manualControlled) {
                this.startRecording(false, game)
                notify({
                    title: "Recording started",
                    message: `Recording started for ${gameToRecord?.productName ?? gameToRecord?.title ?? gameToRecord.executable}`
                })
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

        ProcessManager.addUpdateListener(e => onNewInfo(e))
        const curr = await ProcessManager.getAvailableWindows(true)
        onNewInfo(curr)

        this.registeredAutomatic = true
    }

    public async startRecording(manual = false, discordGameInfo: DetectableGame = null) {
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
        log.silly("CurrVideos", currVideos)

        NodeObs.OBS_service_startRecording()

        let videoName = null
        for (let i = 0; i < 1000; i++) {
            const newVideos = await listVideos()
            if (newVideos.length > currVideos.length) {
                videoName = newVideos.find(e => currVideos.indexOf(e) === -1)
                break
            }

            await sleepSync(50)
            if (i % 10 === 0)
                log.silly("Waiting for new video...")
        }

        const videoPath = recordPath + "/" + videoName
        if (!videoPath)
            log.warn("Video Path could not be obtained")

        this.current = {
            currentInfoPath: videoPath ? videoPath + ".json" : null,
            game: discordGameInfo,
            videoPath: videoPath,
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
            const { currentInfoPath, game, videoPath } = this.current
            const duration = await getDuration(videoPath)
            await fs.writeFile(currentInfoPath, JSON.stringify({
                duration,
                game
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
    return parseFloat(
        res
            .stdout
            .split("\n")
            .find(e => e.includes("duration"))
            .split("=")
            .shift()
    )
}