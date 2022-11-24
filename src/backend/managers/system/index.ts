import { RegManMain } from '@general/register/main';
import { Storage } from '@Globals/storage';
import AutoLaunch from "auto-launch";
import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { MainLogger } from 'src/interfaces/mainLogger';


const launcher = new AutoLaunch({
    name: "Clipture",
    isHidden: true,
})

const log = MainLogger.get("Backend", "Managers", "System")
export class SystemManager {
    static register() {
        RegManMain.onPromise("system_open_clip", async (_, p) => {
            const root = Storage.get("clip_path")
            const clipPath = path.join(root, p)

            SystemManager.openPath(clipPath)
        })
        RegManMain.onPromise("system_get_dashboard_page_default", async () => Storage.get("last_dashboard_page") ?? 0)
        RegManMain.onPromise("system_set_close_behavior", async (_, e) => Storage.set("close_behavior", e))
        RegManMain.onPromise("system_close_curr_window", async e => {
            const allWindows = BrowserWindow.getAllWindows()
            const currWindow = allWindows.find(x => x.webContents.id === e.sender.id)

            SystemManager.handleWindowCloseButton(currWindow)
        })
        RegManMain.onPromise("system_set_default_dashboard_page", async (_, newPage) => {
            Storage.set("last_dashboard_page", newPage)
            console.log("Setting last dashboard page to", newPage)
        })

        RegManMain.onPromise("system_set_autolaunch", (_, e) => this.setAutoLaunch(e))
        RegManMain.onPromise("system_is_autolaunch", () => launcher.isEnabled())
        RegManMain.onPromise("system_change_language", async (_, lang) => Storage.set("language", lang))
        RegManMain.onPromise("system_get_language", async () => Storage.get("language"))
    }

    static openPath(p: string) {
        shell.showItemInFolder(p)
    }

    static toTray(window: BrowserWindow, hidden: boolean) {
        if (hidden) {
            window.minimize()
            window.setSkipTaskbar(true)
        } else {
            window.restore()
            window.setSkipTaskbar(false)
            window.focus()
        }

        RegManMain.send("system_tray_event", hidden)
    }

    static handleWindowCloseButton(window: BrowserWindow) {
        const currSetting = Storage.get("close_behavior") ?? "unset"
        if (currSetting === "close")
            return app.quit()

        if (currSetting === "unset")
            return window.webContents.send("close_behavior_dialog")

        this.toTray(window, true)
    }

    static async setAutoLaunch(shouldLaunch: boolean) {
        const enabled = await launcher.isEnabled()
        log.info("Setting autoLaunch to", shouldLaunch, "curr is", enabled, "packaged", app.isPackaged)

        if (enabled && !shouldLaunch)
            await launcher.disable()

        if (!enabled && shouldLaunch && app.isPackaged)
            await launcher.enable()

        Storage.set("auto_launch", shouldLaunch)
    }

    static async initialize() {
        const isAutoLaunch = Storage.get("auto_launch", false)
        this.setAutoLaunch(isAutoLaunch)
    }
}