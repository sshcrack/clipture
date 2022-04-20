import { ProcessManager } from '@backend/managers/process'
import { getOS } from '@backend/tools/operating-system'
import { RegManMain } from '@general/register/main'
import { NodeObs as notTypedOBS } from '@streamlabs/obs-studio-node'
import fs from "fs/promises"
import { MainLogger } from 'src/interfaces/mainLogger'
import { SettingsCat } from 'src/types/obs/obs-enums'
import { NodeObs } from 'src/types/obs/obs-studio-node'
import { Scene } from '../Scene'
import { DetectableGame, WindowInformation } from '../Scene/interfaces'
import notifier from "node-notifier"
import { Globals } from '@Globals/index'
import got from 'got/dist/source'
import { UseToastOptions } from '@chakra-ui/react'

const reg = RegManMain
const NodeObs: NodeObs = notTypedOBS
const log = MainLogger.get("Backend", "Managers", "OBS", "Core", "Record")
export class RecordManager {
    private recording = false;
    private detectableGames: DetectableGame[] = null
    static instance: RecordManager = null;
    private registeredAutomatic = false;

    constructor() {
        if (RecordManager.instance)
            throw new Error("Record class cannot be instantiated twice.")

        RecordManager.instance = this;
        this.register()
    }

    public getDetectableGames(showToast = true) {
        return got(Globals.gameUrl).then(e => JSON.parse(e.body))
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

            log.debug("Checking matching games...")
            const matchingGames = info.filter(e => {
                return this.detectableGames.some(g =>
                    g?.executables?.some(exe => e.full_exe.toLowerCase().endsWith(exe.name.toLowerCase()) && exe.os === os)
                )
            })

            if (matchingGames.length === 0)
                return

            log.info("Matching games are", matchingGames)
            const gameToRecord = matchingGames.find(e => e.focused) ?? matchingGames[0]
            if (gameToRecord) {
                log.debug("Switching to game", gameToRecord)
                await Scene.switchWindow(gameToRecord)
            }


            log.debug("Trying to record if not recording scene has window:", Scene.getCurrentSetting()?.window)
            if (!this.isRecording() && Scene.getCurrentSetting()?.window)
                this.startRecording()
        }

        log.debug("Registering automatic recording stop")
        setInterval(() => {
            const { window, monitor } = Scene.getCurrentSetting() ?? {}
            if (window && this.isRecording()) {
                const isRunning = processRunning(window.pid)
                if (!isRunning) {
                    this.stopRecording()
                    notifier.notify({
                        title: "Recording stopped",
                        message: `${window.title ?? "Monitor " + monitor} has been recorded successfully`
                    })
                }
            }
        }, 2500)

        ProcessManager.addUpdateListener(e => onNewInfo(e))
        const curr = await ProcessManager.getAvailableWindows(true)
        onNewInfo(curr)
    }

    public async startRecording() {
        if (this.recording) {
            log.debug("Tried to record even though already recording")
            return
        }

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
        RegManMain.send("obs_record_change", false)
    }

    public isRecording() {
        return this.recording;
    }

    private register() {
        reg.onPromise("obs_start_recording", () => this.startRecording())
        reg.onPromise("obs_stop_recording", () => this.stopRecording())
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