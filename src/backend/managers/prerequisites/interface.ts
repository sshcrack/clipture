export type ValidateTypes = "ffmpeg" | "ffprobe" | "obs" | "native_mng"
export type ValidateFuncReturn = {
    valid: boolean,
    errors: ValidateTypes[]
}