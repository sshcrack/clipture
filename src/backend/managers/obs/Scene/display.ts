import { Display, screen } from 'electron';

export async function getDisplayInfoFromIndex(monitorIndex: number) {
    const monitors = screen.getAllDisplays()
    if (monitorIndex >= monitors.length)
        throw new Error(`Monitor with id ${monitorIndex} does not exist`)

    const monitor = monitors[monitorIndex]
    return getDisplayInfo(monitor)
}

export async function getDisplayInfo(monitor: Display) {
    const { width, height } = monitor.size;
    const { scaleFactor } = monitor

    return {
        width,
        height,
        scaleFactor: scaleFactor,
        aspectRatio: width / height,
        physicalWidth: width * scaleFactor,
        physicalHeight: height * scaleFactor
    }
}