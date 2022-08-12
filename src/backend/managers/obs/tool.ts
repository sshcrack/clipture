import { getWebpackDir } from "@backend/tools/fs";
import { app } from "electron"
import { MainGlobals } from "@Globals/mainGlobals";
import path from "path";

const { obsRequirePath } = MainGlobals
const packaged = app.isPackaged
export function getOBSDataPath() {
    return path.join(getWebpackDir(), "../../osn-data").replace("app.asar", "app.asar.unpacked");
}

export function getOBSWorkingDir() {
    return (packaged ? obsRequirePath : path.join(__dirname, "../../node_modules/@streamlabs/obs-studio-node")).replace("app.asar", "app.asar.unpacked")
}

export function getOBSBinary() {
    return path.join(getOBSWorkingDir(), "obs64.exe");
}