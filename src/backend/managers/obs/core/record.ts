import { ProcessManager } from '@backend/managers/process'
import { getOS } from '@backend/tools/operating-system'
import { RegManMain } from '@general/register/main'
import { NodeObs as notTypedOBS } from '@streamlabs/obs-studio-node'
import fs from "fs/promises"
import { MainLogger } from 'src/interfaces/mainLogger'
import { SettingsCat } from 'src/types/obs/obs-enums'
import { NodeObs } from 'src/types/obs/obs-studio-node'
import { Scene } from '../Scene'
import { DetectableGame } from '../Scene/interfaces'
import notifier from "node-notifier"

const reg = RegManMain
const NodeObs: NodeObs = notTypedOBS
const log = MainLogger.get("Backend", "Managers", "OBS", "Core", "Record")
export class RecordManager {
    private recording = false;
    private detectableGames: DetectableGame[] = []
    static instance: RecordManager = null;

    constructor() {
        if(RecordManager.instance)
            throw new Error("Record class cannot be instantiated twice.")

        RecordManager.instance = this;
        this.register()
    }

    public async registerAutomaticRecord() {
        ProcessManager.addUpdateListener(async info => {
            const { window, monitor } = Scene.getCurrentSetting() ?? {}
            if(window && this.isRecording()) {
                const isRunning = processRunning(window.pid)
                if(!isRunning) {
                    await this.stopRecording()
                    notifier.notify({
                        title: "Recording stopped",
                        message: `${window.title ?? "Monitor " + monitor} has been recorded successfully`
                    })
                }
            }

            const os = getOS()
            const matchingGames = info.filter(e => {
                return this.detectableGames.some(g =>
                    g.executables.some(exe => e.full_exe.endsWith(exe.name) && exe.os === os)
                )
            })

            if (matchingGames.length === 0)
                return

            log.debug("Found recordable games", matchingGames)
            const gameToRecord = matchingGames.find(e => e.focused)
            if(gameToRecord)
                await Scene.switchWindow(gameToRecord)


            if(!this.isRecording())
                this.startRecording()
        })
    }

    public async startRecording(filePath?: string) {
        if (this.recording)
            return

        const recordPath = filePath ?? NodeObs.OBS_settings_getSettings(SettingsCat.Output)
            .data
            .find(e => e.nameSubCategory === "Recording")
            .parameters
            .find(e => e.name === "RecFilePath")
            .currentValue as string

        if (!recordPath)
            log.warn("No Record Path set")
        else
            await fs.stat(filePath).catch(() => fs.mkdir(recordPath))

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