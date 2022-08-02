import { AllAudioDevices, DefaultAudioDevice } from '@backend/managers/obs/Scene/interfaces';
import { addPrefixUnderscoreToObject } from 'src/types/additions';

export type AudioEventsPromises = addPrefixUnderscoreToObject<{
    active_sources: () => string[],
    devices: () => AllAudioDevices,
    device_default: () => DefaultAudioDevice
}, "audio">

export type AudioMainToRender = addPrefixUnderscoreToObject<{
    volmeter_update: (deviceId: string, magnitude: number[], peak: number[], inputPeak: number[]) => void
}, "audio">