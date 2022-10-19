import { clamp } from '@backend/tools/math';
import { byOS, OS } from '@backend/tools/operating-system';
import { RegManMain } from '@general/register/main';
import { getAddRemoveListener } from '@general/tools/listener';
import { MainGlobals } from '@Globals/mainGlobals';
import { Storage } from '@Globals/storage';
import type { Global as globalType, IInput, InputFactory as inputType, IScene, IVolmeter, VolmeterFactory as volType } from "@streamlabs/obs-studio-node";
import { FixedSources, SourceInfo } from 'src/components/settings/categories/OBS/Audio/OBSInputDevices/interface';
import { MainLogger } from 'src/interfaces/mainLogger';
import { SettingsCat } from 'src/types/obs/obs-enums';
import { NodeObs as typedObs } from 'src/types/obs/obs-studio-node';
import { FixedLengthArray } from 'type-fest';
import { setOBSSetting as setSetting } from '../base';
import { importOBS } from '../tool';
import { ActiveSource, AudioDevice, AudioUpdateListener, DeviceType } from './interfaces';

const log = MainLogger.get("Backend", "Manager", "OBS", "Scene", "Audio");

type VolmeterInfo = {
    device_id: string,
    input: IInput,
    volmeter: IVolmeter
}

const REFRESH_INTERVAL = 1000 * 10
export class AudioSceneManager {
    private static activeSources = [] as ActiveSource[]
    private static allVolmeters = [] as VolmeterInfo[]
    private static allDesktops = [] as AudioDevice[]
    private static allMics = [] as AudioDevice[]
    private static currentTrack = 2

    private static defaultDesktop = undefined as AudioDevice
    private static defaultMic = undefined as AudioDevice

    private static initialized = false
    private static NodeObs: typedObs
    private static VolmeterFactory: typeof volType
    private static InputFactory: typeof inputType
    private static Global: typeof globalType

    private static updateLoop: NodeJS.Timer = null
    private static listeners = [] as AudioUpdateListener[]

    static async initialize() {
        if (this.initialized)
            return

        const { NodeObs, VolmeterFactory, InputFactory, Global } = await importOBS()
        this.VolmeterFactory = VolmeterFactory
        this.NodeObs = NodeObs
        this.InputFactory = InputFactory
        this.Global = Global
        this.initialized = true

        this.addDeviceCheckLoop()
    }

    static register() {
        RegManMain.onPromise("audio_active_sources", async () => this.activeSources.map(({ device_id, type, volume }) => ({ device_id, type, volume })) as SourceInfo[] as unknown as FixedLengthArray<SourceInfo, 2>)
        RegManMain.onPromise("audio_devices", async () => ({ desktop: this.allDesktops, microphones: this.allMics }))
        RegManMain.onPromise("audio_device_default", async () => this.getDefaultDevices())
        RegManMain.onPromise("audio_device_set", async (_, devices) => this.setAudioDevices(devices))

        this.addDeviceUpdateListener(d => RegManMain.send("audio_device_update", d))
    }

    static async shutdown() {
        if (this.updateLoop)
            clearInterval(this.updateLoop)
    }

    private static addVolmeter({ device_id, type, volume }: SourceInfo) {
        if (!this.initialized)
            throw new Error("Could not add volmeter, not initialized")

        if (device_id.toLowerCase() === "default")
            return log.warn("Cannot add volmeter with device id default.")

        if (this.allVolmeters.some(e => e.device_id === device_id))
            return

        log.silly("Adding volmeter with device_id", device_id)
        const osName = this.getAudioType(type)
        const audioType = type === "desktop" ? "desktop-audio" : "mic-audio"

        const audioSource = this.InputFactory.create(osName, audioType, { device_id, volume });
        audioSource.volume = volume
        audioSource.muted = true

        const volmeter = this.attachVolmeter(audioSource, device_id, volume)
        this.allVolmeters.push({
            device_id,
            input: audioSource,
            volmeter
        })
    }

    private static attachVolmeter(audioSource: IInput, device_id: string, volume = 1) {
        if (!this.initialized)
            throw new Error("Could not attach volmeter, not initialized")
        const volmeter = this.VolmeterFactory.create(1)

        log.info("Attaching to", device_id, "with volume", volume)
        volmeter.attach(audioSource)
        volmeter.addCallback((...args) => {
            const volModified = args.map(e => e.map(x => x - 60 * (1 - volume))) as [magnitude: number[], peak: number[], inputPeak: number[]]
            RegManMain.send("audio_volmeter_update", device_id, ...volModified)
        })

        return volmeter
    }

    static initializeVolmeter() {
        log.info("Initializing voltmeter")
        this.allDesktops.forEach(({ device_id }) => this.addVolmeter({ device_id, type: "desktop", volume: 1 }))
        this.allMics.forEach(({ device_id }) => this.addVolmeter({ device_id, type: "microphone", volume: 1 }))
        log.info("Initialized a total of", this.allVolmeters.length, "volmeters")
    }

    static getDefaultDevices() {
        return {
            desktop: this.defaultDesktop,
            microphone: this.defaultMic
        }
    }

    static addDeviceUpdateListener(listener: AudioUpdateListener) {
        return getAddRemoveListener(listener, this.listeners)
    }

    static addDeviceCheckLoop() {
        if (this.updateLoop)
            return

        this.updateLoop = setInterval(() => {
            const newDesktop = this.getAudioDevices("desktop")
            const newMics = this.getAudioDevices("microphone")


            const hasNewDesktop = JSON.stringify(newDesktop) !== JSON.stringify(this.allDesktops)
            const hasNewMics = JSON.stringify(newMics) !== JSON.stringify(this.allMics)

            this.allDesktops = newDesktop
            this.allMics = newMics

            if (!hasNewDesktop && !hasNewMics)
                return

            this.listeners.map(e => e({ desktop: newDesktop, microphones: newMics }))
        }, REFRESH_INTERVAL)
    }

    static setAudioDevices(devices: FixedSources) {
        this.removeAllDevices()
        devices.map(({ device_id, type, volume }) => {
            this.currentTrack = this.addAudioDevice(device_id, this.currentTrack, type, volume)
        })

        setSetting(this.NodeObs, SettingsCat.Output, 'RecTracks', parseInt('1'.repeat(this.currentTrack - 1), 2)); // Bit mask of used tracks: 1111 to use first four (from available six)
        log.info("Saving Audio Devices to config:", devices)
        Storage.set("audio_devices", devices)
    }

    static removeAllDevices() {
        log.info("Removing a total of", this.activeSources.length, "...")
        this.activeSources
            .map(({ input }) => {
                this.allVolmeters = this.allVolmeters.filter(e => e.device_id !== input.settings.device_id)
                input.remove()
            })

        this.activeSources = []
        this.currentTrack = 2
    }

    static async initializeAudioSources(scene: IScene) {
        if (!this.initialized)
            throw new Error("Could not initialize audio sources, not initialized")
        this.NodeObs.RegisterSourceCallback(() => { })

        log.info("Setting up audio sources...")
        this.Global.setOutputSource(1, scene);
        setSetting(this.NodeObs, SettingsCat.Output, 'Track1Name', 'Mixed: all sources');

        const allDesktopDevices = this.getAudioDevices("desktop")
        const allMicrophones = this.getAudioDevices("microphone")

        AudioSceneManager.allDesktops = allDesktopDevices
        AudioSceneManager.allMics = allMicrophones

        const { desktop: defaultDesktop, mic: defaultMic } = await this.getDefaultAudioDevices()
            .catch(() => ({ desktop: null, mic: null } as AudioReturn))

        const devices = Storage.get("audio_devices")
        let currDevices = [{ device_id: defaultDesktop, type: "desktop", volume: 1 }, { device_id: defaultMic, type: "microphone", volume: 1 }] as SourceInfo[]
        if (devices.length === 2) {
            currDevices = devices
        } else {
            log.info("Audio Devices are empty, defaulting.")
            Storage.set("audio_devices", currDevices)
        }

        const defaultDesktopInfo = allDesktopDevices.find(e => e.device_id === defaultDesktop)
        const defaultMicInfo = allMicrophones.find(e => e.device_id === defaultMic)

        this.defaultDesktop = defaultDesktopInfo
        this.defaultMic = defaultMicInfo

        log.info("Adding audio devices to track:", currDevices)
        currDevices.forEach(dev => {
            this.currentTrack = this.addAudioDevice(dev.device_id, this.currentTrack, dev.type, dev.volume ?? 1)
        })

        setSetting(this.NodeObs, SettingsCat.Output, 'RecTracks', parseInt('1'.repeat(this.currentTrack - 1), 2)); // Bit mask of used tracks: 1111 to use first four (from available six)

        this.initializeVolmeter()
    }

    private static getAudioType(type: DeviceType) {
        return type === "desktop" ?
            byOS<string>({ [OS.Windows]: 'wasapi_output_capture', [OS.Mac]: 'coreaudio_output_capture' }) :
            byOS<string>({ [OS.Windows]: 'wasapi_input_capture', [OS.Mac]: 'coreaudio_input_capture' })
    }

    static getAudioDevices(type: DeviceType): { device_id: string, name: string }[] {
        if (!this.initialized)
            throw new Error("Could not get audio devices, not initialized")

        const osName = this.getAudioType(type)
        const audioType = type === "desktop" ? "desktop-audio" : "mic-audio"

        const dummyDevice = this.InputFactory.create(osName, audioType, { device_id: 'does_not_exist' });
        const devices = (dummyDevice.properties.get('device_id') as any).details.items.map(({ name, value }: { name: string, value: string }) => {
            return { device_id: value, name, };
        });
        dummyDevice.release();
        return devices;
    };

    public static addAudioDevice(device_id: string, currTrack: number, type: DeviceType, volume: number) {
        volume = clamp(volume, 0, 1)

        if (this.activeSources.length >= 2) {
            log.error("Could not add audio device", device_id, type, "because too many devices are already added.")
            return currTrack
        }

        if (!this.initialized) {
            throw new Error("Couldn't add audio sources, not initialized")
        }

        const osName = this.getAudioType(type)
        const audioType = type === "desktop" ? "desktop-audio" : "mic-audio"

        const audioSource = this.InputFactory.create(osName, audioType, { device_id: device_id });

        setSetting(this.NodeObs, SettingsCat.Output, `Track${currTrack}Name`, device_id);
        audioSource.volume = volume
        audioSource.audioMixers = 1 | (1 << currTrack - 1); // Bit mask to output to only tracks 1 and current track

        console.log("Source volume is", audioSource.volume, "Type", osName, audioType)
        log.log(`Adding Track ${currTrack} with device id (${device_id}) to audioSource with type ${audioType} and setting it with volume ${volume}`)
        this.Global.setOutputSource(currTrack, audioSource);
        currTrack++;

        log.log("Current volume of audio source is", audioSource.volume)

        const volmeter = this.attachVolmeter(audioSource, device_id, volume)
        this.allVolmeters.push({
            device_id,
            input: audioSource,
            volmeter
        })

        this.activeSources.push({
            device_id,
            input: audioSource,
            type,
            volume
        })
        return currTrack
    }

    private static async getDefaultAudioDevices(): Promise<AudioReturn> {
        const execa = (await import("execa")).execa;
        const defaultAudioSources = await execa(MainGlobals.nativeMngExe, ["audio"])
        try {
            const res = JSON.parse(defaultAudioSources.stdout) as AudioReturn
            log.info("Default AudioDevices are: ", res)
            return res;
        } catch (e) {
            const errorStats = `Stderr: ${defaultAudioSources.stderr}\n
            Stdout: ${defaultAudioSources.stdout}
            command: ${defaultAudioSources.command}
            code: ${defaultAudioSources.exitCode}`

            log.error("Failed command:", errorStats)
            log.error("Could not get default audio devices", e)
            throw [
                errorStats,
                e]
        }
    }
}

interface AudioReturn {
    desktop: string,
    mic: string
}