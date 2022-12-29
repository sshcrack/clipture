import type { IInput } from '@streamlabs/obs-studio-node'

export interface WindowInformation {
    className: string,
    executable: string,
    arguments: string[],
    full_exe: string,
    title: string,
    pid: number,
    hwnd: number,
    productName: string,
    monitorDimensions?: MonitorDimensions,
    intersectsMultiple: boolean,
    focused: boolean
}

export type MonitorDimensions = {
    width: number,
    height: number,
    index: number
}

export type CurrentSetting = null | {
    resolution: [number, number]
    window: WindowInformation,
    monitor?: number,
    oldSize?: {
        width: number,
        height: number
    },
    size: {
        width: number,
        height: number
    }
}

export interface CurrentSettingDescription {
    description: string
}

export interface DetectableGame {
    bot_public?: boolean;
    bot_require_code_grant?: boolean;
    cover_image?: string;
    description: string;
    developers?: Developer[];
    executables?: Executable[];
    guild_id?: string;
    hook: boolean;
    icon: null | string;
    id: string;
    name: string;
    publishers?: Developer[];
    rpc_origins?: string[];
    splash?: string;
    summary: string;
    third_party_skus?: ThirdParty[];
    type: number | null;
    verify_key: string;
    primary_sku_id?: string;
    slug?: string;
    aliases?: string[];
    overlay?: boolean;
    overlay_compatibility_hook?: boolean;
    privacy_policy_url?: string;
    terms_of_service_url?: string;
    eula_id?: string;
    deeplink_uri?: string;
}

export interface Developer {
    id: string;
    name: string;
}

export interface Executable {
    is_launcher: boolean;
    name: string;
    os: OS;
    arguments?: string;
}

export enum OS {
    Darwin = "darwin",
    Linux = "linux",
    Win32 = "win32",
}

export interface ThirdParty {
    distributor: Distributor;
    id: null | string;
    sku: null | string;
}

export enum Distributor {
    Battlenet = "battlenet",
    Discord = "discord",
    Epic = "epic",
    Glyph = "glyph",
    Gog = "gog",
    GooglePlay = "google_play",
    Origin = "origin",
    Steam = "steam",
    Twitch = "twitch",
    Uplay = "uplay",
}


export interface AudioDevice {
    name: string,
    device_id: string
}

export interface AllAudioDevices {
    desktop: AudioDevice[],
    microphones: AudioDevice[]
}

export interface DefaultAudioDevice {
    desktop: AudioDevice,
    microphone: AudioDevice
}

export type DeviceType = "desktop" | "microphone"

export interface ActiveSource {
    input: IInput,
    device_id: string,
    volume: number,
    type: DeviceType
}

export type AudioUpdateListener = (devices: AllAudioDevices) => unknown