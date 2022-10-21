export type ClientBoundRecReturn = { width: number, height: number, x: number, y: number }
export type Encoder = "obs_x264" | "obs_qsv11" | "ffmpeg_nvenc" | "amd_amf_h264"
export const AvailableEncoders = ["obs_x264", "obs_qsv11", "ffmpeg_nvenc", "amd_amf_h264"] as Encoder[]
export type CurrRec = { encoder: Encoder, preset: string }
