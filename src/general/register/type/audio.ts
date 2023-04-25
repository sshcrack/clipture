import { AllAudioDevices, DefaultAudioDevice } from '@backend/managers/obs/Scene/interfaces';
import { FixedSources, SourceInfo } from 'src/componentsOld/settings/categories/OBS/Audio/OBSInputDevices/interface';
import { addPrefixUnderscoreToObject } from 'src/types/additions';
import { FixedLengthArray } from 'type-fest';
export type AudioEventsPromises = addPrefixUnderscoreToObject<{
    active_sources: () => FixedLengthArray<SourceInfo, 2>,
    devices: () => AllAudioDevices,
    device_default: () => DefaultAudioDevice,
    device_set: (type: FixedSources) => void
}, "audio">

export type AudioMainToRender = addPrefixUnderscoreToObject<{
    volmeter_update: (deviceId: string, magnitude: number[], peak: number[], inputPeak: number[]) => void,
    device_update: (device: AllAudioDevices) => void
}, "audio">