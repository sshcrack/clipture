import { RegManMain } from '@general/register/main';
import { Subject } from "rxjs";
import { first } from "rxjs/operators";
import { MainLogger } from 'src/interfaces/mainLogger';
import { getLocalizedT } from 'src/locales/backend_i18n';
import type { IAdvancedRecording, ISimpleRecording, EOutputSignal} from "@streamlabs/obs-studio-node"
import { IConfigProgress, NodeObs as typedObs } from "src/types/obs/obs-studio-node";
import { importOBS } from "../tool";

const log = MainLogger.get("Backend", "Managers", "OBS", "Signals")
export class SignalsManager {
    private static signals = new Subject<EOutputSignal>()
    private static NodeObs: typedObs
    private static progress = new Subject<IConfigProgress>()

    static async initialize() {
        this.NodeObs = (await importOBS()).NodeObs
        RegManMain.onPromise("obs_auto_config", () => this.startAutoConfig())
    }

    static getNextSignalInfo() {
        return new Promise<EOutputSignal>((resolve, reject) => {
            const t = getLocalizedT("backend", "obs")
            this.signals.pipe(first()).subscribe(signalInfo => resolve(signalInfo));
            setTimeout(() => reject(t("signal_timeout")), 30000);
        });
    }

    static getNextAutoConfigProgress(errorMsgName: string) {
        return new Promise<IConfigProgress>((resolve, reject) => {
            const t = getLocalizedT("backend", "obs")
            this.progress.pipe(first()).subscribe(prog => resolve(prog));
            setTimeout(() => reject(`${t("autconfig_timeout")} - ${errorMsgName}`), 30000);
        });
    }

    public static reconnectSignals(recorder: IAdvancedRecording | ISimpleRecording) {
        recorder.signalHandler = (signalInfo: EOutputSignal) => {
            this.signals.next(signalInfo);
        };
    }

    private static initializeAutoConfig() {
        this.NodeObs.InitializeAutoConfig(info => {
            if (info.event == 'stopping_step' || info.event == 'done' || info.event == 'error') {
                log.debug("AutoConfig new signal: ", info)
                this.progress.next(info);
            }
        }, {})
    }

    public static async startAutoConfig() {
        RegManMain.send("obs_auto_config_progress", { percent: 0, status: "Initializing..." })
        this.initializeAutoConfig();

        const asyncRun = async () => {
            RegManMain.send("obs_auto_config_progress", { percent: 0.5, status: "Starting Recording test..." })
            log.silly("Recording Encoder Test")


            log.silly("Starting Recording Encoder Test...")
            this.NodeObs.StartRecordingEncoderTest();
            RegManMain.send("obs_auto_config_progress", { percent: .9, status: "Saving settings..." })
            log.silly("Waiting for RecordingEncoderTest Signal...")
            let signal = await this.getNextAutoConfigProgress("RecordingEncoderTest");
            let is_valid = signal.event === "stopping_step"
                && signal.description === "recordingEncoder_test"
                && signal.percentage === 100

            if (!is_valid)
                throw new Error(`RecordingEncoderTest returned invalid signal: ${JSON.stringify(signal)}`)

/*
            log.silly("Checking settings...")
            this.NodeObs.StartCheckSettings()

            log.silly("Waiting for checking settings signal...")
            signal = await this.getNextAutoConfigProgress("CheckSettings");
            is_valid = signal.event === "stopping_step"
                && signal.description === "checking_settings"
                && signal.percentage === 100

            if (!is_valid)
                throw new Error(`CheckSettings returned invalid signal: ${JSON.stringify(signal)}`)
*/
            log.silly("Saving settings...")
            this.NodeObs.StartSaveSettings();
            log.silly("Waiting for saving settings signal...")
            signal = await this.getNextAutoConfigProgress('Save Settings');

            is_valid = signal.event === "stopping_step"
                && signal.description === "saving_settings"
                && signal.percentage === 100

            if (!is_valid)
                throw new Error(`SavingSettings returned invalid signal: ${JSON.stringify(signal)}`)

            log.silly("Waiting for done signal...")
            signal = await this.getNextAutoConfigProgress('Autoconfig done');
            is_valid = signal.event === "done"

            if (!is_valid)
                throw new Error(`AutoConfigProgress returned invalid signal: ${JSON.stringify(signal)}`)

            RegManMain.send("obs_auto_config_progress", { percent: 1, status: "Done." })
        }

        return asyncRun()
            .finally(() => this.NodeObs.TerminateAutoConfig())
    }
}