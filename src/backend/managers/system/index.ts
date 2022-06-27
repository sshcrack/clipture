import { RegManMain } from '@general/register/main';
import { Storage } from '@Globals/storage';
import { shell } from 'electron';
import path from 'path';

export class SystemManager {
    static register() {
        RegManMain.onPromise("system_open_clip", async (_, p) => {
            const root = Storage.get("clip_path")
            const clipPath = path.join(root, p)

            SystemManager.openPath(clipPath)
        })
        RegManMain.onPromise("system_get_dashboard_page_default", async () => Storage.get("last_dashboard_page") ?? 0)
        RegManMain.onPromise("system_set_default_dashboard_page", async (_, newPage) => {
            Storage.set("last_dashboard_page", newPage)
            console.log("Setting last dashboard page to", newPage)
        })
    }

    static openPath(p: string) {
        shell.showItemInFolder(p)
    }
}