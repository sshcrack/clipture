export type ValidateTypes = "ffmpeg" | "ffprobe" | "obs"
export type ValidateFuncReturn = {
    valid: boolean,
    errors: ValidateTypes[]
}