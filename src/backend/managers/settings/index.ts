import { existsProm } from '@backend/tools/fs';
import { RegManMain } from '@general/register/main';
import { MainGlobals } from '@Globals/mainGlobals';
import { Storage } from '@Globals/storage';
import { BrowserWindow, dialog, shell } from 'electron';
import { constants as fsConstants } from "fs";
import fsProm from "fs/promises";
import path from "path";
import { MainLogger } from 'src/interfaces/mainLogger';
import { setOBSSetting } from '../obs/base';

const log = MainLogger.get("Backend", "Managers", "Settings")
export class SettingsManager {
    static register() {
        RegManMain.onPromise("settings_get_clip_path", async () => path.resolve(Storage.get("clip_path")))
        RegManMain.onPromise("settings_open_folder", async (_, p) => shell.openPath(p))
        RegManMain.onPromise("settings_select_folder", (e, p) => {
            const window = BrowserWindow.fromWebContents(e.sender)
            return dialog.showOpenDialog(window, {
                properties: ["openDirectory"],
                defaultPath: p
            })
        })
        RegManMain.onPromise("settings_set_clip_path", async (_, newPath) => {
            if (!newPath)
                return

            const folderExists = await existsProm(newPath)
            log.debug("Setting clip path to", newPath, "exists", folderExists)

            if (!folderExists) {
                //Fails if invalid path
                log.debug("Making directory")
                await fsProm.mkdir(newPath, { recursive: true })
            }

            const readable = await fsProm.access(newPath, fsConstants.R_OK)
                .then(() => true)
                .catch(() => false)
            const writable = await fsProm.access(newPath, fsConstants.W_OK)
                .then(() => true)
                .catch(() => false)

            log.debug("Path", newPath, "readable", readable, "writable", writable)
            if (!writable)
                throw new Error("Clipture can not write to the directory you selected.")

            if (!readable)
                throw new Error("Clipture can not read the directory you selected.")

            Storage.set("clip_path", newPath)
            await MainGlobals.obs.configure()
        })
    }
}