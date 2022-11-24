export type ValidateTypes = "ffmpeg" | "ffprobe" | "obs" | "native_mng" | "vcredist"
export type ValidateFuncReturn = {
    valid: boolean,
    errors: ValidateTypes[]
}