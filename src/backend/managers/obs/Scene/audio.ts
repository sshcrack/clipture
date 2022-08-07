import { byOS, OS } from '@backend/tools/operating-system';
import { RegManMain } from '@general/register/main';
import { MainGlobals } from '@Globals/mainGlobals';
import { Storage } from '@Globals/storage';
import { Global, IInput, InputFactory, IScene, IVolmeter, NodeObs as notTypedObs, VolmeterFactory } from '@streamlabs/obs-studio-node';
import { FixedSources, SourceInfo } from 'src/components/settings/categories/OBS/Audio/OBSInputDevices/interface';
import { MainLogger } from 'src/interfaces/mainLogger';
import { SettingsCat } from 'src/types/obs/obs-enums';
import { NodeObs } from 'src/types/obs/obs-studio-node';
import { FixedLengthArray } from 'type-fest';
import { setOBSSetting as setSetting } from '../base';
import { ActiveSource, AudioDevice, DeviceType } from './interfaces';

const log = MainLogger.get("Backend", "Manager", "OBS", "Scene", "Audio");
const NodeObs = notTypedObs as NodeObs

type VolmeterInfo = {
    device_id: string,
    input: IInput,
    volmeter: IVolmeter
}

export class AudioSceneManager {
    private static activeSources = [] as ActiveSource[]
    private static allVolmeters = [] as VolmeterInfo[]
    private static allDesktops = [] as AudioDevice[]
    private static allMics = [] as AudioDevice[]
    private static currentTrack = 2

    private static defaultDesktop = undefined as AudioDevice
    private static defaultMic = undefined as AudioDevice

    static register() {
        RegManMain.onPromise("audio_active_sources", async () => this.activeSources.map(({ device_id, type, input, volume }) => ({ device_id, type, volume })) as SourceInfo[] as unknown as FixedLengthArray<SourceInfo, 2>)
        RegManMain.onPromise("audio_devices", async () => ({ desktop: this.allDesktops, microphones: this.allMics }))
        RegManMain.onPromise("audio_device_default", async () => this.getDefaultDevices())
        RegManMain.onPromise("audio_device_set", async (_, devices) => this.setAudioDevices(devices))
    }

    private static addVolmeter({ device_id, type, volume }: SourceInfo) {
        if (this.allVolmeters.some(e => e.device_id === device_id))
            return

        log.silly("Adding volmeter with device_id", device_id)

        const osName = this.getAudioType(type)
        const audioType = type === "desktop" ? "desktop-audio" : "mic-audio"

        const audioSource = InputFactory.create(osName, audioType, { device_id, volume });
        audioSource.volume = volume

        const volmeter = this.attachVolmeter(audioSource, device_id)
        this.allVolmeters.push({
            device_id,
            input: audioSource,
            volmeter
        })
    }

    private static attachVolmeter(audioSource: IInput, device_id: string) {
        const volmeter = VolmeterFactory.create(1)

        volmeter.attach(audioSource)
        volmeter.addCallback((...args) =>{
            RegManMain.send("audio_volmeter_update", device_id, ...args)
        })
        return volmeter
    }

    static initializeVolmeter() {
        this.allDesktops.forEach(({ device_id }) => this.addVolmeter({ device_id, type: "desktop", volume: 1 }))
        this.allMics.forEach(({ device_id }) => this.addVolmeter({ device_id, type: "microphone", volume: 1 }))
    }

    static getDefaultDevices() {
        return {
            desktop: this.defaultDesktop,
            microphone: this.defaultMic
        }
    }

    static setAudioDevices(devices: FixedSources) {
        this.removeAllDevices()
        devices.map(({ device_id, type, volume }) => {
            this.currentTrack = this.addAudioDevice(device_id, this.currentTrack, type, volume)
        })

        log.info("Saving Audio Devices to config:", devices)
        Storage.set("audio_devices", devices)
    }

    private static removeAllDevices() {
        this.activeSources
            .map(({ input }) => input.remove())

        this.activeSources = []
        this.currentTrack = 2
    }

    static async initializeAudioSources(scene: IScene) {
        NodeObs.RegisterSourceCallback(() => { })

        log.info("Setting up audio sources...")
        Global.setOutputSource(1, scene);
        setSetting(SettingsCat.Output, 'Track1Name', 'Mixed: all sources');

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

        this.initializeVolmeter()
    }

    private static getAudioType(type: DeviceType) {
        return type === "desktop" ?
            byOS<string>({ [OS.Windows]: 'wasapi_output_capture', [OS.Mac]: 'coreaudio_output_capture' }) :
            byOS<string>({ [OS.Windows]: 'wasapi_input_capture', [OS.Mac]: 'coreaudio_input_capture' })
    }

    static getAudioDevices(type: DeviceType): { device_id: string, name: string }[] {
        const osName = this.getAudioType(type)
        const audioType = type === "desktop" ? "desktop-audio" : "mic-audio"

        const dummyDevice = InputFactory.create(osName, audioType, { device_id: 'does_not_exist' });
        const devices = (dummyDevice.properties.get('device_id') as any).details.items.map(({ name, value }: { name: string, value: string }) => {
            return { device_id: value, name, };
        });
        dummyDevice.release();
        return devices;
    };

    public static addAudioDevice(device_id: string, currTrack: number, type: DeviceType, volume: number) {
        if (this.activeSources.length >= 2) {
            log.error("Could not add audio device", device_id, type, "because too many devices are already added.")
            return currTrack
        }

        const osName = this.getAudioType(type)
        const audioType = type === "desktop" ? "desktop-audio" : "mic-audio"

        const audioSource = InputFactory.create(osName, audioType, { device_id: device_id, volume: volume });
        audioSource.volume = volume

        log.log(`Adding Track ${currTrack} with device id (${device_id}) to audioSource with type ${audioType} and setting it with volume ${volume}`)
        setSetting(SettingsCat.Output, `Track${currTrack}Name`, device_id);
        audioSource.audioMixers = 1 | (1 << currTrack - 1); // Bit mask to output to only tracks 1 and current track
        Global.setOutputSource(currTrack, audioSource);
        currTrack++;

        log.log("Current volume of audio source is", audioSource.volume)
        //audioSource.volume = type === "microphone" ? 1.5 : 1

        const volmeter = this.attachVolmeter(audioSource, device_id)
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