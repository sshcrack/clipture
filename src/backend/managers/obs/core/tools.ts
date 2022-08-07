import { getOS } from '@backend/tools/operating-system';
import { DetectableGame, WindowInformation } from '../Scene/interfaces';

export function isDetectableGameInfo(detectable: DetectableGame, winInfo: WindowInformation) {
    const os = getOS()
    return detectable?.executables?.some(exe => winInfo?.full_exe?.toLowerCase()?.endsWith(exe?.name?.toLowerCase()) && exe?.os === os)
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