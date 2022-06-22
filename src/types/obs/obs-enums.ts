
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

export const enum SettingsCat {
    General = 'General',
    Stream = 'Stream',
    Output = 'Output',
    Audio = 'Audio',
    Video = 'Video',
    Hotkeys = 'Hotkeys',
    Advanced = 'Advanced'
}


/**
 * To be passed to Input.flags
 */
 export const enum ESourceFlags {
    Unbuffered = (1 << 0),
    ForceMono = (1 << 1)
}

export const enum EMonitoringType {
    None,
    MonitoringOnly,
    MonitoringAndOutput
}

export const enum EOrderMovement {
    Up,
    Down,
    Top,
    Bottom
}

export const enum EDeinterlaceFieldOrder {
    Top,
    Bottom
}

export const enum EVideoCodes {
	Success = 0,
	Fail = -1,
	NotSupported = -2,
	InvalidParam = -3,
	CurrentlyActive = -4,
	ModuleNotFound = -5	
}

export const enum EHotkeyObjectType {
	Frontend = 0,
	Source = 1,
	Output = 2,
	Encoder = 3,
	Service = 4
}

export const enum EDeinterlaceMode {
    Disable,
    Discard,
    Retro,
    Blend,
    Blend2X,
    Linear,
    Linear2X,
    Yadif,
    Yadif2X
}

export const enum EFontStyle {
  Bold = (1<<0),
  Italic = (1<<1),
  Underline = (1<<2),
  Strikeout = (1<<3),
}

/**
 * Enumeration describing the type of a property
 */
export const enum EPropertyType {
    Invalid,
    Boolean,
    Int,
    Float,
    Text,
    Path,
    List,
    Color,
    Button,
    Font,
    EditableList,
    FrameRate,
    Group,
    ColorAlpha,
    Capture,
}

export const enum EListFormat {
    Invalid,
    Int,
    Float,
    String
}

export const enum EEditableListType {
    Strings,
    Files,
    FilesAndUrls
}

export const enum EPathType {
    File,
    FileSave,
    Directory
}

export const enum ETextType {
    Default,
    Password,
    Multiline
}

export const enum ENumberType {
    Scroller,
    Slider
}

/**
 * A binary flag representing alignment
 */
export const enum EAlignment {
    Center = 0,
    Left = (1 << 0),
    Right = (1 << 1),
    Top = (1 << 2),
    Bottom = (1 << 3),
    TopLeft = (Top | Left),
    TopRight = (Top | Right),
    BottomLeft = (Bottom | Left),
    BottomRight = (Bottom | Right)
}

/**
 * A binary flag representing output capabilities
 * Apparently you can't fetch these for now (???)
 */
export const enum EOutputFlags {
    Video = (1<<0),
    Audio = (1<<1),
    AV = (Video | Audio),
    Encoded = (1<<2),
    Service = (1<<3),
    MultiTrack = (1<<4)
}

/**
 * A binary flag representing source output capabilities
 */
export const enum ESourceOutputFlags {
    Video = (1 << 0),
    Audio = (1 << 1),
    Async = (1 << 2), 
    AsyncVideo = Async | Video,
    CustomDraw = (1 << 3),
    Interaction = (1 << 5),
    Composite = (1 << 6),
    DoNotDuplicate = (1 << 7),
    Deprecated = (1 << 8),
    DoNotSelfMonitor = (1 << 9)
}

export const enum ESceneDupType {
    Refs,
    Copy,
    PrivateRefs,
    PrivateCopy
}

/**
 * Describes the type of source
 */
export const enum ESourceType {
    Input,
    Filter,
    Transition,
    Scene,
}

/**
 * Describes the type of encoder
 */
export const enum EEncoderType {
    Audio,
    Video
}

/**
 * Describes algorithm type to use for volume representation.
 */
export const enum EFaderType {
    Cubic,
    IEC /* IEC 60-268-18 */,
    Log /* Logarithmic */
}

export const enum EColorFormat {
	Unknown,
	A8,
	R8,
	RGBA,
	BGRX,
	BGRA,
	R10G10B10A2,
	RGBA16,
	R16,
	RGBA16F,
	RGBA32F,
	RG16F,
	RG32F,
	R16F,
	R32F,
	DXT1,
	DXT3,
	DXT5
}

export const enum EZStencilFormat {
	None,
	Z16,
	Z24_S8,
	Z32F,
	Z32F_S8X24
}

export const enum EScaleType {
    Default,
    Point,
    FastBilinear,
    Bilinear,
    Bicubic
}

export const enum ERangeType {
    Default,
    Partial,
    Full
}

export const enum EVideoFormat {
    None,
    I420,
    NV12,
    YVYU,
    YUY2,
    UYVY,
    RGBA,
    BGRA,
    BGRX,
    Y800,
    I444
}

export const enum EBoundsType {
    None,
    Stretch,
    ScaleInner,
    ScaleOuter,
    ScaleToWidth,
    ScaleToHeight,
    MaxOnly
}

export const enum EColorSpace {
    Default,
    CS601,
    CS709
}

export const enum ESpeakerLayout {
    Unknown,
    Mono,
    Stereo,
    TwoOne,
    Quad,
    FourOne,
    FiveOne,
    FiveOneSurround,
    SevenOne,
    SevenOneSurround,
    Surround
}

export const enum ESceneSignalType {
    ItemAdd,
    ItemRemove,
    Reorder,
    ItemVisible,
    ItemSelect,
    ItemDeselect,
    ItemTransform
}

export const enum EOutputCode {
    Success = 0,
    BadPath = -1,
    ConnectFailed = -2,
    InvalidStream = -3,
    Error = -4,
    Disconnected = -5,
    Unsupported = -6,
    NoSpace = -7,
    EncoderError = -8,
    OutdatedDriver = -65,
}

export const enum ECategoryTypes {
    NODEOBS_CATEGORY_LIST = 0,
	NODEOBS_CATEGORY_TAB = 1
}

export const enum ERenderingMode {
    OBS_MAIN_RENDERING = 0,
	OBS_STREAMING_RENDERING = 1,
	OBS_RECORDING_RENDERING = 2
}