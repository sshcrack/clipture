import { getWebpackDir } from "@backend/tools/fs";
import { MainGlobals } from "@Globals/mainGlobals";
import path from "path";

const { obsRequirePath } = MainGlobals
export function getOBSDataPath() {
    return path.join(getWebpackDir(), "../../osn-data").replace("app.asar", "app.asar.unpacked");
}

export function getOBSWorkingDir() {
    return obsRequirePath.replace("app.asar", "app.asar.unpacked")
}

export function getOBSBinary() {
    return path.join(getOBSWorkingDir(), "obs64.exe");
}