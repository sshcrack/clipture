import { MainGlobals } from '@Globals/mainGlobals'

export async function getDuration(inputPath: string) {
    const execa = (await import("execa")).execa
    const res = await execa(MainGlobals.ffprobeExe, ["-i", inputPath, "-show_format"])
    const numberRes = res
        .stdout
        ?.split("\n")
        ?.find(e => e.includes("duration"))
        ?.split("=")
        ?.shift()

    if (!numberRes)
        throw new Error(`Could not get duration with ffprobe at ${MainGlobals.ffprobeExe} with clip ${inputPath}`)
    return parseFloat(numberRes)
}


export function processRunning(pid: number) {
    try {
        process.kill(pid, 0)
        return true
    } catch {
        return false
    }
}