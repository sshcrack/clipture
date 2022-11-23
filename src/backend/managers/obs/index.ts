import { existsProm } from '@backend/tools/fs'
import { getOS } from '@backend/tools/operating-system'
import { Storage } from '@Globals/storage'
import { mkdir } from 'fs/promises'
import prettyMS from "pretty-ms"
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

    constructor() {
        this.register()
    }

    public async initialize() {
        const inst = LockManager.instance
        await inst.waitTillReleased()

        if (this.obsInitialized)
            return log.warn("OBS already initialized")

        log.info("Initializing OBS...")
        const steps = [
            {
                title: "Importing OBS...",
                func: async () => this.NodeObs = (await importOBS()).NodeObs
            },
            {
                title: "Initializing OBS...",
                func: () => this.initOBS()
            },
            {
                title: "Configuring OBS...",
                func: () => this.configure()
            },
            {
                title: "Connecting signals...",
                func: () => SignalsManager.initialize()
            },
            {
                title: "Initializing scene...",
                func: () => Scene.initialize()
            },
            {
                title: "Setting up auto record...",
                func: () => RecordManager.instance.initialize()
            },
            {
                title: "Registering hotkeys...",
                func: () => BookmarkManager.initialize()
            },
            {
                title: "Adding discord presence",
                func: () => DiscordManager.initialize()
            },
            {
                title: "Initializing Preview...",
                func: () => this.previewInstance.initialize()
            },
            {
                title: "Listening to game changes...",
                func: () => GameManager.addUpdateLoop()
            },
            {
                title: "Adding to storage manager...",
                func: () => StorageManager.register()
            },
            {
                title: "Overlay starting...",
                func: () => OverlayManager.initialize()
            }
        ] as { title: string, func: () => Promise<unknown> }[]

        inst.lock({
            percent: 0,
            status: "Loading.."
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
            status: "OBS initialized"
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
        const initResult = this.NodeObs.OBS_API_initAPI("en-US", obsDataPath, "1.0.0") as number;
        if (initResult !== 0) {
            const errorReasons = {
                "-2": "DirectX could not be found on your system. Please install the latest version of DirectX for your machine here <https://www.microsoft.com/en-us/download/details.aspx?id=35?> and try again.",
                "-5": "Failed to initialize OBS. Your video drivers may be out of date, or libObs may not be supported on your system.",
            };


            const result = initResult.toString() as keyof typeof errorReasons;
            const errorMessage = errorReasons[result] ?? `An unknown error #${initResult} was encountered while initializing OBS.`;

            log.error("Could not initialize OBS", errorMessage);
            this.shutdown(true);

            throw Error(errorMessage);
        }

        log.info("Successfully initialized OBS!")
        setInterval(() => RegManMain.send("performance", this.NodeObs.OBS_API_getPerformanceStatistics()), 2000)
    }

    public async shutdown(force = false) {
        if (!this.obsInitialized && !force)
            return

        log.info("Shutting OBS down...")
        await this.previewInstance.shutdown().catch(log.error)
        await this.recordManager.shutdown().catch(log.error)
        await Scene.shutdown()
        try {
            this.NodeObs.OBS_service_removeCallback();
            this.NodeObs.IPC.disconnect()
        } catch (e) {
            const newErr = new Error(`Exception when shutting down OBS process${e}`)
            log.error(newErr)

            throw newErr;
        }
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
        const Output = SettingsCat.Output
        const Video = SettingsCat.Video

        const fps = Storage.get("obs")?.fps ?? 60
        const bitrate = Storage.get("obs")?.bitrate ?? 10000 // 10 Mbps

        setSetting(this.NodeObs, Video, 'FPSCommon', fps);
        setSetting(this.NodeObs, Output, 'VBitrate', bitrate);
        setSetting(this.NodeObs, Output, 'Bitrate', bitrate);

        const cpuEncoder = getOS() === 'win32' ? 'x264' : 'obs_x264'

        setSetting(this.NodeObs, Output, "Mode", "Advanced")
        setSetting(this.NodeObs, Output, 'StreamEncoder', cpuEncoder);

        log.info("Defaulting to", cpuEncoder)
        setSetting(this.NodeObs, Output, 'RecPreset', 'fast')
        setSetting(this.NodeObs, Output, 'RecEncoder', cpuEncoder);

        const storageEncoder = Storage.get("obs_encoder")
        const availableEncoders = getEncoders(this.NodeObs)

        const gpuEncoder = availableEncoders?.filter(e => e !== cpuEncoder).slice(-1)[0] ?? cpuEncoder
        const encoder = storageEncoder && availableEncoders.includes(storageEncoder) ? storageEncoder : gpuEncoder

        log.info("Available encoders are", JSON.stringify(availableEncoders), "using", encoder)
        Storage.set("obs_encoder", encoder)

        const availablePresets = getEncoderPresets(encoder as Encoder)
        let preset: string = null
        if (availablePresets) {
            const storedPreset = Storage.get("obs_preset")
            const middlePresets = availablePresets[Math.floor(availablePresets.length / 2)]

            preset = storedPreset && availablePresets.includes(storedPreset) ? storedPreset : middlePresets

            Storage.set("obs_preset", preset)
        }

        this.setEncoderPreset(encoder, preset)

        const clipPath = Storage.get("clip_path")
        if (!(await existsProm(clipPath)))
            await mkdir(clipPath)
        setSetting(this.NodeObs, Output, 'RecFilePath', clipPath);
        setSetting(this.NodeObs, Output, 'RecFormat', 'mkv');
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
            const available = getEncoders(this.NodeObs)
            if (!available || !available.includes(encoder))
                throw new Error("Encoder not available")

            const presets = getEncoderPresets(encoder)
            if (!presets || !presets.includes(preset))
                throw new Error("Preset not available")

            this.setEncoderPreset(encoder, preset)
            Storage.set("obs_encoder", encoder)
            Storage.set("obs_preset", preset)
        })
        reg.onPromise("obs_update_settings", async (_, partly) => {
            const { fps, bitrate, capture_method } = partly
            log.info("Updating settings", fps, bitrate, capture_method)
            const isNull = <T>(e: T | undefined | null) => typeof e === "undefined" || e === null

            if (!isNull(fps) && fps <= 0)
                throw new Error("Invalid fps number")

            if (!isNull(bitrate) && bitrate <= 0)
                throw new Error("Invalid bitrate")

            if (!isNull(capture_method) && capture_method !== "desktop" && capture_method !== "window")
                throw new Error("Invalid capture method")

            Storage.set("obs", { ...(Storage.get("obs")), ...partly })
            this.configure()
        })
    }
}