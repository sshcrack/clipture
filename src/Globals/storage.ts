import { app } from 'electron';
import Store from "electron-store";
import path from 'path';

const defaultInstall = app.getPath("userData")
const defaultClips = path.join(defaultInstall, "clips")

export const mainStore = new Store({
    defaults: {
        "install_dir": defaultInstall,
        "install_dir_selected": false,
        "clip_path": defaultClips
    }
})
