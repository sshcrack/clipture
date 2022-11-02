import { getOS } from '@backend/tools/operating-system';
import { DetectableGame, WindowInformation } from '../Scene/interfaces';

export function isDetectableGameInfo(detectable: DetectableGame, winInfo: WindowInformation) {
    const os = getOS()
    const fullExe = winInfo?.full_exe?.split("\\").join("/")
    const executable = winInfo?.executable
    const args = winInfo.arguments;

    const isGame = detectable?.executables?.some(exe => {
        const isExe = exe?.name && exe?.name?.includes("/") ? fullExe.includes(exe.name) : exe.name.toLowerCase() === executable.toLowerCase()
        return (
            isExe ||
            args?.some(e => e?.toLowerCase()?.includes(exe?.arguments?.toLowerCase()))
        )
            && exe?.os === os
    })
    return isGame
}


export function isWindowInfoSame(a: WindowInformation, b: WindowInformation) {
    return a.className === b.className && a.full_exe === b.full_exe
}

export function getWindowInfoId(info: WindowInformation) {
    return `${info.className}-${info.full_exe}`
}

export function sleepSync(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    });
}

export function compareWinInfo(a: WindowInformation, b: WindowInformation) {
    const oldInfoReduced = {
        ...a,
        focused: false
    }

    const winInfoReduced = {
        ...b,
        focused: false
    }

    const srt = (obj: any) => JSON.stringify(obj)
    const x = srt(oldInfoReduced)
    const y = srt(winInfoReduced)

    return x === y
}