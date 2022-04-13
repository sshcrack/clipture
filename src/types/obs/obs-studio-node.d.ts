declare module "@streamlabs/obs-studio-node" {
    import * as obs from '@streamlabs/obs-studio-node';

    export const enum EOBSOutputType {
        Streaming = 'streaming',
        Recording = 'recording',
        ReplayBuffer = 'replay-buffer',
    }

    export const enum EOBSOutputSignal {
        Starting = 'starting',
        Start = 'start',
        Activate = 'activate',
        Stopping = 'stopping',
        Stop = 'stop',
        Deactivate = 'deactivate',
        Reconnect = 'reconnect',
        ReconnectSuccess = 'reconnect_success',
        Writing = 'writing',
        Wrote = 'wrote',
        WriteError = 'writing_error',
    }

    export const enum EOBSInputTypes {
        AudioLine = 'audio_line',
        ImageSource = 'image_source',
        ColorSource = 'color_source',
        Slideshow = 'slideshow',
        BrowserSource = 'browser_source',
        FFMPEGSource = 'ffmpeg_source',
        TextGDI = 'text_gdiplus',
        TextFT2 = 'text_ft2_source',
        VLCSource = 'vlc_source',
        MonitorCapture = 'monitor_capture',
        WindowCapture = 'window_capture',
        GameCapture = 'game_capture',
        DShowInput = 'dshow_input',
        WASAPIInput = 'wasapi_input_capture',
        WASAPIOutput = 'wasapi_output_capture',
        AVCaptureInput = 'av_capture_input',
        CoreAudioInput = 'coreaudio_input_capture',
        CoreAudioOutput = 'coreaudio_output_capture'
    }

    export const enum EOBSFilterTypes {
        FaceMask = 'face_mask_filter',
        Mask = 'mask_filter',
        Crop = 'crop_filter',
        Gain = 'gain_filter',
        Color = 'color_filter',
        Scale = 'scale_filter',
        Scroll = 'scroll_filter',
        GPUDelay = 'gpu_delay',
        ColorKey = 'color_key_filter',
        Clut = 'clut_filter',
        Sharpness = 'sharpness_filter',
        ChromaKey = 'chroma_key_filter',
        AsyncDelay = 'async_delay_filter',
        NoiseSuppress = 'noise_suppress_filter',
        InvertPolarity = 'invert_polarity_filter',
        NoiseGate = 'noise_gate_filter',
        Compressor = 'compressor_filter',
        Limiter = 'limiter_filter',
        Expander = 'expander_filter',
        LumaKey = 'luma_key_filter',
        NDI = 'ndi_filter',
        NDIAudio = 'ndi_audiofilter',
        PremultipliedAlpha = 'premultiplied_alpha_filter',
        VST = 'vst_filter'
    }

    export const enum EOBSTransitionTypes {
        Cut = 'cut_transition',
        Fade = 'fade_transition',
        Swipe = 'swipe_transition',
        Slide = 'slide_transition',
        Stinger = 'obs_stinger_transition',
        FadeToColor = 'fade_to_color_transition',
        Wipe = 'wipe_transition'
    }

    export const enum EOBSSettingsCategories {
        General = 'General',
        Stream = 'Stream',
        Output = 'Output',
        Audio = 'Audio',
        Video = 'Video',
        Hotkeys = 'Hotkeys',
        Advanced = 'Advanced'
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
        OBS_API_getPerformanceData: () => any;
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
