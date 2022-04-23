import { byOS, OS } from '@backend/tools/operating-system';
import { MainGlobals } from '@Globals/mainGlobals';
import { Global, InputFactory, IScene } from '@streamlabs/obs-studio-node';
import { debug } from 'console';
import { MainLogger } from 'src/interfaces/mainLogger';
import { SettingsCat } from 'src/types/obs/obs-enums';
import { setOBSSetting as setSetting } from '../base';

const log = MainLogger.get("Backend", "Manager", "OBS", "Scene", "Audio");
export class AudioSceneManager {

    static async initializeAudioSources(scene: IScene) {
        log.info("Setting up audio sources...")
        Global.setOutputSource(1, scene);
        const execa = await (await import("execa")).execa;
        const defaultAudioSources = await execa(MainGlobals.nativeMngExe, ["audio"])
        const { desktop, mic } = JSON.parse(defaultAudioSources.stdout) as AudioReturn;


        setSetting(SettingsCat.Output, 'Track1Name', 'Mixed: all sources');
        let currentTrack = 2;

        this.getAudioDevices(byOS({ [OS.Windows]: 'wasapi_output_capture', [OS.Mac]: 'coreaudio_output_capture' }), 'desktop-audio')
            .forEach((metadata: { device_id: string, name: string }) => {
                if (metadata.device_id.toLowerCase() !== desktop) return;
                const source = InputFactory.create(byOS({ [OS.Windows]: 'wasapi_output_capture', [OS.Mac]: 'coreaudio_output_capture' }), 'desktop-audio', { device_id: metadata.device_id });
                log.log("Setting up audio device source", metadata.name);
                setSetting(SettingsCat.Output, `Track${currentTrack}Name`, metadata.name);
                source.audioMixers = 1 | (1 << currentTrack - 1); // Bit mask to output to only tracks 1 and current track
                Global.setOutputSource(currentTrack, source);
                currentTrack++;
            });

        this.getAudioDevices(byOS({ [OS.Windows]: 'wasapi_input_capture', [OS.Mac]: 'coreaudio_input_capture' }), 'mic-audio')
            .forEach((metadata: { device_id: string, name: string }) => {
                if (metadata.device_id.toLowerCase() !== mic) return;
                const source = InputFactory.create(byOS({ [OS.Windows]: 'wasapi_input_capture', [OS.Mac]: 'coreaudio_input_capture' }), 'mic-audio', { device_id: metadata.device_id });
                log.log("Setting up mic source", metadata.name);
                setSetting(SettingsCat.Output, `Track${currentTrack}Name`, metadata.name);
                source.audioMixers = 1 | (1 << currentTrack - 1); // Bit mask to output to only tracks 1 and current track
                Global.setOutputSource(currentTrack, source);
                currentTrack++;
            });

        setSetting(SettingsCat.Output, 'RecTracks', parseInt('1'.repeat(currentTrack - 1), 2)); // Bit mask of used tracks: 1111 to use first four (from available six)

    }

    private static getAudioDevices(type: string, subtype: string) {
        const dummyDevice = InputFactory.create(type, subtype, { device_id: 'does_not_exist' });
        const devices = (dummyDevice.properties.get('device_id') as any).details.items.map(({ name, value }: { name: string, value: string }) => {
            return { device_id: value, name, };
        });
        dummyDevice.release();
        return devices;
    };
}

interface AudioReturn {
    desktop: string,
    mic: string
}