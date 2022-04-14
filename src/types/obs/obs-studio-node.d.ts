
declare module "@streamlabs/obs-studio-node" {
    import { EOBSSettingsCategories } from './obs-enums';
    import * as obs from '@streamlabs/obs-studio-node';

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
        IPC: {
            setServerPath(binaryPath: string, workingDirectoryPath?: string): void;
            connect(uri: string): void;
            host(uri: string): EIPCError;
            disconnect(): void;
        },
        SetWorkingDirectory: (dir: string) => void,
        OBS_API_initAPI: (lang: string, dataPath: string, version: string) => number,
        OBS_service_removeCallback: () => void,
        OBS_settings_getSettings: (category: EOBSSettingsCategories) => Settings,
        OBS_settings_saveSettings: (category: EOBSSettingsCategories, settings: SettingsData[]) => void,
        OBS_service_startRecording: () => void,
        OBS_service_stopRecording: () => void,

        OBS_content_resizeDisplay(displayId: number, width: number, height: number)
        OBS_content_destroyDisplay: (displayId: number) => void,
        OBS_content_createSourcePreviewDisplay: (handle: Buffer, sourcePrevId: string, displayId: string) => void
        OBS_content_setShouldDrawUI: (displayId: number, drawUi: boolean) => void,
        OBS_content_setPaddingColor: (displayId, r: number, g: number, b: number) => void,
        OBS_content_setPaddingSize: (displayId: number, size: number) => void,
        OBS_API_getPerformanceStatistics: () => PerformanceStatistics;
    }

    type IPC = {
        setServerPath(binaryPath: string, workingDirectoryPath?: string): void;
        connect(uri: string): void;
        host(uri: string): void;
        disconnect(): void;
    }

    export const NodeObs: INodeObs;
    export default obs;
}
