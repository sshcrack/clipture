import { Display, screen } from 'electron';
import { getLocalizedT } from 'src/locales/backend_i18n';

export async function getDisplayInfoFromIndex(monitorIndex: number) {
    const t = getLocalizedT("backend", "obs")
    const monitors = screen.getAllDisplays()
    if (monitorIndex >= monitors.length)
        throw new Error(t("monitor_not_exists", { monitorIndex }))

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