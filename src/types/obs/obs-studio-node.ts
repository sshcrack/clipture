import type { IIPC } from '@streamlabs/obs-studio-node';
import { EOBSOutputSignal, EOBSOutputType, EOutputCode, SettingsCat } from './obs-enums';

export type TConfigEvent = 'starting_step' | 'progress' | 'stopping_step' | 'error' | 'done';
export interface IConfigProgress {
    event: TConfigEvent;
    description: string;
    percentage?: number;
    continent?: string;
}

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

export type AutoConfigOptions= {
    continent?: string,
    service_name?: string
}


export interface IOBSOutputSignalInfo {
    type: EOBSOutputType;
    signal: EOBSOutputSignal;
    code: EOutputCode;
    error: string;
}

type INodeObs = {
    IPC: IIPC,
    SetWorkingDirectory: (dir: string) => void,
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
    OBS_service_connectOutputSignals: (listener: (signal: IOBSOutputSignalInfo) => unknown) => void;
    RegisterSourceCallback: (callback: () => void) => void;

    InitializeAutoConfig: (callback: (prog: IConfigProgress) => unknown, config: AutoConfigOptions) => boolean;
    StartBandwidthTest: () => void;
    StartStreamEncoderTest: () => void;
    StartRecordingEncoderTest: () => void;
    StartCheckSettings: () => boolean;
    StartSetDefaultSettings: () => boolean;
    StartSaveSettings: () => boolean;
    TerminateAutoConfig: () => boolean;
}

export type NodeObs = INodeObs;
