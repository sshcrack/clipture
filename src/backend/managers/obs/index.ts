import { existsProm } from '@backend/tools/fs'
import { getOS } from '@backend/tools/operating-system'
import { Storage } from '@Globals/storage'
import { AdvancedRecordingFactory, ERecordingFormat, ERecSplitType, IAdvancedRecording, SimpleRecordingFactory, VideoEncoderFactory, VideoFactory } from '@streamlabs/obs-studio-node'
import { app } from 'electron'
import { mkdir, readFile } from 'fs/promises'
import path from 'path'
import prettyMS from "pretty-ms"
import { getLocalizedT } from 'src/locales/backend_i18n'
import { SettingsCat } from 'src/types/obs/obs-enums'
import { NodeObs as typedObs } from 'src/types/obs/obs-studio-node'
import { v4 as uuid } from "uuid"
import { RegManMain } from '../../../general/register/main'
import { MainLogger } from '../../../interfaces/mainLogger'
import { DiscordManager } from '../discord'
import { GameManager } from '../game'
import { OverlayManager } from '../game/overlay'
import { LockManager } from '../lock'
import { StorageManager } from '../storage'
import { setOBSSetting as setSetting } from './base'
import { BookmarkManager } from './bookmark'
import { PreviewManager } from './core/preview'
import { RecordManager } from './core/record'
import { Scene } from './Scene'
import { SignalsManager } from './Signals'
import { getEncoders, getOBSBinary, getOBSDataPath, getOBSWorkingDir, importOBS } from './tool'
import { Encoder } from './types'
import { getEncoderPresets, setPresetWithEncoder } from './util'


const reg = RegManMain
const log = MainLogger.get("Managers", "OBS")

export class OBSManager {
    private obsInitialized = false
    private NodeObs: typedObs
    public previewInstance = new PreviewManager()
    public recordManager = new RecordManager()
    public recording: IAdvancedRecording = null

    constructor() {
        this.register()
    }

    public async initialize() {
        const t = getLocalizedT("backend", "obs.initialize")
        const inst = LockManager.instance
        await inst.waitTillReleased()

        if (this.obsInitialized)
            return log.warn("OBS already initialized")

        log.info("Initializing OBS...")
        const steps = [
            {
                title: t("importing"),
                func: async () => this.NodeObs = (await importOBS()).NodeObs
            },
            {
                title: t("initializing"),
                func: () => this.initOBS()
            },
            {
                title: t("configuring"),
                func: () => this.configure()
            },
            {
                title: t("connect"),
                func: () => SignalsManager.initialize()
            },
            {
                title: t("scene"),
                func: () => Scene.initialize()
            },
            {
                title: t("auto_record"),
                func: () => RecordManager.instance.initialize()
            },
            {
                title: t("hotkeys"),
                func: () => BookmarkManager.initialize()
            },
            {
                title: t("discord"),
                func: () => DiscordManager.initialize()
            },
            {
                title: t("preview"),
                func: () => this.previewInstance.initialize()
            },
            {
                title: t("game_changes"),
                func: () => GameManager.addUpdateLoop()
            },
            {
                title: t("storage_manager"),
                func: () => StorageManager.register()
            },
            {
                title: t("overlay"),
                func: () => OverlayManager.initialize()
            }
        ] as { title: string, func: () => Promise<unknown> }[]

        inst.lock({
            percent: 0,
            status: t("loading")
        })

        for (let i = 0; i < steps.length; i++) {
            const { title, func } = steps[i]
            const percent = i / steps.length
            inst.updateListeners({
                percent,
                status: title
            })

            log.info(`Step ${i + 1}/${steps.length} (${(percent * 100).toFixed(1)}%): ${title}`)
            const start = Date.now()
            let success = false
            let lastErr = undefined
            for (let i = 0; i < 10; i++) {
                const res = await (func()
                    ?.then(() => undefined)
                    ?.catch(e => e))
                if (!res) {
                    success = true
                    break;
                }
                log.error("Could not complete step, retrying... (try: ", i, ")")
                log.error(res)
                lastErr = res
            }
            if (!success) {
                inst.unlock({ percent: 0, status: lastErr?.message ?? "Error" })
                throw lastErr
            }
            const diff = Date.now() - start
            log.info(`Step ${i + 1}/${steps.length} done after ${prettyMS(diff)}`)
        }

        inst.unlock({
            percent: 1,
            status: t("obs_initialized")
        })

        StorageManager.check().catch(e => { log.error("Storage:", e) })
        this.obsInitialized = true
    }

    private async initOBS() {
        const hostId = `clipture-${uuid()}`;
        const workDir = getOBSWorkingDir()
        const binary = getOBSBinary();

        log.debug(`Initializing OBS... (${hostId}}`);
        log.debug("WorkDir is", workDir)

        this.NodeObs.IPC.setServerPath(binary, workDir)
        this.NodeObs.IPC.host(hostId);
        this.NodeObs.SetWorkingDirectory(workDir);

        const obsDataPath = getOBSDataPath()
        const t = getLocalizedT("backend", "obs.initialize")
        const initResult = this.NodeObs.OBS_API_initAPI("en-US", obsDataPath, "1.0.0") as number;
        if (initResult !== 0) {
            const errorReasons = {
                "-2": t("errors.minus_two"),
                "-5": t("errors.minus_five"),
            };


            const result = initResult.toString() as keyof typeof errorReasons;
            const errorMessage = errorReasons[result] ?? t("errors.unknown", { initResult });

            log.error("Could not initialize OBS", errorMessage);
            this.shutdown(true);

            throw Error(errorMessage);
        }

        log.info("Successfully initialized OBS!")
        setInterval(() => RegManMain.send("performance", this.NodeObs.OBS_API_getPerformanceStatistics()), 2000)
    }

    public async shutdown(force = false) {
        const t = getLocalizedT("backend", "obs.initialize")
        if (!this.obsInitialized && !force)
            return

        log.info("Shutting OBS down...")
        await this.previewInstance.shutdown().catch(log.error)
        await this.recordManager.shutdown().catch(log.error)
        await Scene.shutdown()
        let err: Error = null
        try {
            log.debug("Removing callback...")
            this.NodeObs.OBS_service_removeCallback();
            log.debug("Disconnecting IPC...")
            this.NodeObs.IPC.disconnect()

        } catch (e) {
            const newErr = new Error(t("errors.shut_down", { e }))
            log.error(newErr)

            err = newErr
        }

        // Kill OBS now (it should be exited by now)
        log.debug("Killing OBS")
        await this.killOBS()

        if (err)
            throw err
    }

    private async killOBS() {
        const pidFile = path.join(app.getPath("temp"), "server.pid")
        const exists = await existsProm(pidFile)

        log.silly("Killing OBS with pidFile at", pidFile, "exists", exists)
        if (!exists)
            return

        const pidFileContent = await readFile(pidFile)
        const pid = pidFileContent.readInt16LE()

        log.silly("Killing OBS with pid", pid)
        const execa = (await import("execa")).execa
        await execa("taskkill", ["/IM", pid.toString(), "/F"])
    }

    private setEncoderPreset(encoder: Encoder, preset: string) {
        const Output = SettingsCat.Output

        log.info("Setting encoder", encoder)
        setSetting(this.NodeObs, Output, 'RecEncoder', encoder);


        log.info("Trying to set preset", preset)
        if (!preset)
            setPresetWithEncoder(this.NodeObs, encoder as Encoder, preset)
    }

    public async configure() {
        log.info("Configuring obs...")

        const fps = Storage.get("obs")?.fps ?? 60
        VideoFactory.videoContext.fpsNum = fps

        const clipPath = Storage.get("clip_path")
        if (!(await existsProm(clipPath)))
            await mkdir(clipPath)

        const simple = Storage.get("obs_simple_preset")
        if (!simple) {
            const recording = AdvancedRecordingFactory.create()
            recording.enableFileSplit = false
            recording.format = ERecordingFormat.MKV
            recording.path = clipPath
            recording.splitType = ERecSplitType.Manual
            recording.overwrite = true;
            recording.noSpace = false;
            recording.useStreamEncoders = false;

            const cpuEncoder = getOS() === 'win32' ? 'x264' : 'obs_x264'

            const storageEncoder = Storage.get("obs_encoder", cpuEncoder)
            const availableEncoders = getEncoders(this.NodeObs)

            const gpuEncoder = availableEncoders?.filter(e => e !== cpuEncoder).slice(-1)[0] ?? cpuEncoder
            const encoder = storageEncoder && availableEncoders.includes(storageEncoder) ? storageEncoder : gpuEncoder
            recording.videoEncoder = VideoEncoderFactory.create(encoder, `video-encoder-${uuid()}`);

            this.recording = recording
        } else {
            const recording = SimpleRecordingFactory.create()
            recording.enableFileSplit = false
            recording.format = ERecordingFormat.MKV
            recording.path = clipPath
            recording.splitType = ERecSplitType.Manual
            recording.overwrite = true
            recording.noSpace = true
            recording.quality = simple
        }
    }

    private register() {
        log.log("Registering OBS Events...")
        reg.onSync("obs_is_initialized", () => this.obsInitialized)
        reg.onPromise("obs_initialize", () => this.initialize())
        reg.onPromise("obs_get_settings", async () => {
            const e = Storage.get("obs")
            return {
                ...e,
                capture_method: e.capture_method ?? "window"
            }
        })
        reg.onPromise("obs_automatic_record", async (_, automaticRecord) => this.recordManager.setAutomaticRecord(automaticRecord))
        reg.onPromise("obs_is_automatic_record", async () => Storage.get("automatic_record") ?? true)
        reg.onPromise("obs_get_presets", async (_, encoder) => getEncoderPresets(encoder))
        reg.onPromise("obs_get_encoders", async () => getEncoders(this.NodeObs))
        reg.onPromise("obs_get_rec", async () => ({
            encoder: Storage.get("obs_encoder"),
            preset: Storage.get("obs_preset")
        }))
        reg.onPromise("obs_set_rec", async (_, { encoder, preset }) => {
            const t = getLocalizedT("backend", "obs.initialize")

            const available = getEncoders(this.NodeObs)
            if (!available || !available.includes(encoder))
                throw new Error(t("errors.encoder"))

            const presets = getEncoderPresets(encoder)
            if (!presets || !presets.includes(preset))
                throw new Error(t("error.preset"))

            this.setEncoderPreset(encoder, preset)
            Storage.set("obs_encoder", encoder)
            Storage.set("obs_preset", preset)
        })
        reg.onPromise("obs_update_settings", async (_, partly) => {
            const { fps, bitrate, capture_method } = partly
            const t = getLocalizedT("backend", "obs.initialize")

            log.info("Updating settings", fps, bitrate, capture_method)
            const isNull = <T>(e: T | undefined | null) => typeof e === "undefined" || e === null

            if (!isNull(fps) && fps <= 0)
                throw new Error(t("errors.fps"))

            if (!isNull(bitrate) && bitrate <= 0)
                throw new Error(t("errors.bitrate"))

            if (!isNull(capture_method) && capture_method !== "desktop" && capture_method !== "window")
                throw new Error(t("errors.clip_method"))

            Storage.set("obs", { ...(Storage.get("obs")), ...partly })
            this.configure()
        })
    }
}