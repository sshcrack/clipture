import { IIPC } from '@streamlabs/obs-studio-node';
import { SettingsCat } from './obs-enums';

export interface SettingsParameter {
    name: string,
    currentValue: string | number,
    values: string[]
}

export interface SettingsData {
    parameters: SettingsParameter[],
    nameSubCategory: string
}

export interface Settings {
    data: SettingsData[]
}

export interface PerformanceStatistics {
    CPU: number,
    averageTimeToRenderFrame: number,
    diskSpaceAvailable: string,
    frameRate: number,
    memoryUsage: number,
    numberDroppedFrames: number,
    percentageDroppedFrames: number,
    recordingBandwidth: number,
    recordingDataOutput: number,
    streamingBandwidth: number,
    streamingDataOutput: number,
}
/*
CPU: 1.3
averageTimeToRenderFrame: 0.911154
diskSpaceAvailable: "48.9637 GB"
frameRate: 60.0000024000001
memoryUsage: 212.41015625
numberDroppedFrames: 0
percentageDroppedFrames: 0
recordingBandwidth: 3661.571060753706
recordingDataOutput: 92.81574058532715
streamingBandwidth: 0
streamingDataOutput: 0
*/

type INodeObs = {
    IPC: IIPC,

    SetWorkingDirectory: (dir: string) => void,
    RegisterSourceCallback: (e: (dunno_what_arguments: string) => void) => void,
    RemoveSourceCallback: () => void

    OBS_API_initAPI: (lang: string, dataPath: string, version: string) => number,
    OBS_service_removeCallback: () => void,
    OBS_settings_getSettings: (category: SettingsCat) => Settings,
    OBS_settings_saveSettings: (category: SettingsCat, settings: SettingsData[]) => void,
    OBS_service_startRecording: () => void,
    OBS_service_stopRecording: () => void,
    OBS_service_startStreaming: () => void,
    OBS_service_stopStreaming: (forceStop: boolean) => void,

    OBS_content_resizeDisplay: (displayId: string, width: number, height: number) => void,
    OBS_content_destroyDisplay: (displayId: string) => void,
    OBS_content_createSourcePreviewDisplay: (handle: Buffer, sourcePrevId: string, displayId: string) => void
    OBS_content_setShouldDrawUI: (displayId: string, drawUi: boolean) => void,
    OBS_content_setPaddingColor: (displayId: string, r: number, g: number, b: number) => void,
    OBS_content_setPaddingSize: (displayId: string, size: number) => void,
    OBS_content_moveDisplay: (displayId: string, x: number, y: number) => void,
    OBS_content_setBackgroundColor: (displayId: string, r: number, g: number, b: number, alpha: number) => void,
    OBS_API_getPerformanceStatistics: () => PerformanceStatistics;
}

export type NodeObs = INodeObs;
