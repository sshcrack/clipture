import { MainLogger } from 'src/interfaces/mainLogger'
import { SettingsCat } from 'src/types/obs/obs-enums'
import type { NodeObs } from 'src/types/obs/obs-studio-node'
import { setOBSSetting } from './base'
import { Encoder } from './types'

const log = MainLogger.get("OBS", "Util")
export function encodeString(str: string) {
    return str
        .split("#").join("#22")
        .split(":").join("#3A")
}

export function decodeString(str: string) {
    return str
        .split("#3A").join(":")
        .split("#22").join("#")
}

export function getEncoderPresets(encoder: Encoder) {
    switch (encoder) {
        case "x264":
        case "obs_x264":
            return ["ultrafast", "superfast", "veryfast", "faster", "fast", "medium", "slow", "slower"]
        case "obs_qsv11":
            return ["speed", "balanced", "quality"]

        case "ffmpeg_nvenc":
            //TODO hardcoded, change later
            return ["default", "slow", "medium", "fast"]

        case "amd_amf_h264":
            return ["speed", "balanced", "quality"]

        default:
            return null
    }
}

export function setPresetWithEncoder(nodeObs: NodeObs, encoder: Encoder, preset: string) {
    switch (encoder) {
        case "amd_amf_h264":
            setOBSSetting(nodeObs, SettingsCat.Output, "AMDPreset", preset)
            break;
        case "ffmpeg_nvenc":
            setOBSSetting(nodeObs, SettingsCat.Output, "NVENCPreset", preset)
            break;

            default:
            setOBSSetting(nodeObs, SettingsCat.Output, "Preset", preset)
            break;
    }

    log.info("Setting RecPreset to", preset)
    setOBSSetting(nodeObs, SettingsCat.Output, "RecPreset", preset)
}