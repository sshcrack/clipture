import { getWebpackDir } from "@backend/tools/fs";
import { app } from "electron"
import { MainGlobals } from "@Globals/mainGlobals";
import path from "path";
import { MainLogger } from "src/interfaces/mainLogger";

const log = MainLogger.get("Backend", "Maangers", "OBS", "tools")
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

export async function importOBS() {
    console.log("OBS Require path is", obsRequirePath, "split", obsRequirePath.split("\\").join("/"))
    const prom = packaged ? eval(`import("${"file:///" + path.join(obsRequirePath, "index.js").split("\\").join("/")}")`) :  eval(`import("${obsRequirePath}")`)
    const res = await prom as typeof import("@streamlabs/obs-studio-node")
    log.info("Imported OBS", Object.keys(res ?? {})?.length, "elements")
    return res
}