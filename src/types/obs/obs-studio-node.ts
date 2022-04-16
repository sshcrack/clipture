import { IIPC } from '@streamlabs/obs-studio-node';
import { EOBSSettingsCategories } from './obs-enums';

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
    numberDroppedFrames: number,
    percentageDroppedFrames: number,
    streamingBandwidth: number,
    streamingDataOutput: number,
    recordingBandwidth: number,
    recordingDataOutput: number,
    frameRate: number,
    averageTimeToRenderFrame: number,
    memoryUsage: number,
    diskSpaceAvailable: string
}

type INodeObs = {
    IPC: IIPC,
    SetWorkingDirectory: (dir: string) => void,
    OBS_API_initAPI: (lang: string, dataPath: string, version: string) => number,
    OBS_service_removeCallback: () => void,
    OBS_settings_getSettings: (category: EOBSSettingsCategories) => Settings,
    OBS_settings_saveSettings: (category: EOBSSettingsCategories, settings: SettingsData[]) => void,
    OBS_service_startRecording: () => void,
    OBS_service_stopRecording: () => void,

    OBS_content_resizeDisplay: (displayId: number, width: number, height: number) => void,
    OBS_content_destroyDisplay: (displayId: number) => void,
    OBS_content_createSourcePreviewDisplay: (handle: Buffer, sourcePrevId: string, displayId: string) => void
    OBS_content_setShouldDrawUI: (displayId: number, drawUi: boolean) => void,
    OBS_content_setPaddingColor: (displayId: number, r: number, g: number, b: number) => void,
    OBS_content_setPaddingSize: (displayId: number, size: number) => void,
    OBS_API_getPerformanceStatistics: () => PerformanceStatistics;
}

export type NodeObs = INodeObs;
