import { byOS, OS } from '@backend/tools/operating-system';
import { MainGlobals } from '@Globals/mainGlobals';
import { Storage } from '@Globals/storage';
import { Global, InputFactory, IScene } from '@streamlabs/obs-studio-node';
import { MainLogger } from 'src/interfaces/mainLogger';
import { SettingsCat } from 'src/types/obs/obs-enums';
import { setOBSSetting as setSetting } from '../base';

const log = MainLogger.get("Backend", "Manager", "OBS", "Scene", "Audio");
export class AudioSceneManager {
    static async initializeAudioSources(scene: IScene) {
        log.info("Setting up audio sources...")
        Global.setOutputSource(1, scene);
        setSetting(SettingsCat.Output, 'Track1Name', 'Mixed: all sources');

        const allDesktopDevices = this.getAudioDevices("desktop")
        const allMicrophones = this.getAudioDevices("microphone")

        const { desktop: defaultDesktop, mic: defaultMic } = await this.getDefaultAudioDevices()
            .catch(() => ({ desktop: null, mic: null }))

        const { desktop: savedDesktops, mic: savedMics } = Storage.get("audio_devices")
        const finalDesktops = savedDesktops.filter(e => allDesktopDevices.map(e => e.device_id).includes(e))
        const finalMics = savedMics.filter(e => allMicrophones.map(e => e.device_id).includes(e))

        if (finalDesktops.length === 0)
            finalDesktops.push(defaultDesktop)

        if (finalMics.length === 0)
            finalMics.push(defaultMic)

        Storage.set("audio_devices", { desktop: finalDesktops, mic: finalMics })
        let currentTrack = 2;


        const defaultDesktopName = allDesktopDevices.find(e => e.device_id === defaultDesktop)?.name
        const defaultMicName = allMicrophones.find(e => e.device_id === defaultMic)?.name

        log.debug("Default: Desktop", defaultDesktop, "name:", defaultDesktopName, "Microphone", defaultMic, "name:", defaultMicName, "Inputs", allDesktopDevices, allMicrophones)
        currentTrack = this.addAudioDevice(defaultDesktop ?? finalDesktops[0], currentTrack, "desktop")
        currentTrack = this.addAudioDevice(defaultMic ?? finalMics[0], currentTrack, "microphone")
    }

    private static getAudioType(type: "desktop" | "microphone") {
        return type === "desktop" ?
            byOS<string>({ [OS.Windows]: 'wasapi_output_capture', [OS.Mac]: 'coreaudio_output_capture' }) :
            byOS<string>({ [OS.Windows]: 'wasapi_input_capture', [OS.Mac]: 'coreaudio_input_capture' })
    }

    static getAudioDevices(type: "desktop" | "microphone"): { device_id: string, name: string }[] {
        const osName = this.getAudioType(type)
        const audioType = type === "desktop" ? "desktop-audio" : "mic-audio"

        const dummyDevice = InputFactory.create(osName, audioType, { device_id: 'does_not_exist' });
        const devices = (dummyDevice.properties.get('device_id') as any).details.items.map(({ name, value }: { name: string, value: string }) => {
            return { device_id: value, name, };
        });
        dummyDevice.release();
        return devices;
    };

    private static addAudioDevice(device_id: string, currTrack: number, type: "desktop" | "microphone") {
        const osName = this.getAudioType(type)
        const audioType = type === "desktop" ? "desktop-audio" : "mic-audio"

        const audioSource = InputFactory.create(osName, audioType, { device_id: device_id });

        log.log(`Adding Track ${currTrack} with device id (${device_id}) to audioSource with type ${audioType} and setting it`)
        setSetting(SettingsCat.Output, `Track${currTrack}Name`, device_id);
        audioSource.audioMixers = 1 | (1 << currTrack - 1); // Bit mask to output to only tracks 1 and current track
        Global.setOutputSource(currTrack, audioSource);
        currTrack++;

        return currTrack
    }

    private static async getDefaultAudioDevices() {
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