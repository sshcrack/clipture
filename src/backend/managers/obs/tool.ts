import { getWebpackDir } from "@backend/tools/fs";
import { MainGlobals } from "@Globals/mainGlobals";
import path from "path";
import { MainLogger } from "src/interfaces/mainLogger";
import { SettingsCat } from 'src/types/obs/obs-enums';
import type { NodeObs } from 'src/types/obs/obs-studio-node';
import { getAvailableValues } from './base';
import { Encoder } from './types';

const log = MainLogger.get("Backend", "Maangers", "OBS", "tools")
const { obsRequirePath } = MainGlobals
const packaged = MainGlobals.isPackaged
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
    const prom = packaged ? eval(`import("${"file:///" + path.join(obsRequirePath, "index.js").split("\\").join("/")}")`) : eval(`import("${obsRequirePath}")`)
    const res = await prom as typeof import("@streamlabs/obs-studio-node")
    log.info("Imported OBS", Object.keys(res ?? {})?.length, "elements")
    return res
}

export function getEncoders(nodeObs: NodeObs) {
    for (let i = 0; i < 10; i++) {
        const availableEncoders = getAvailableValues(nodeObs, SettingsCat.Output, 'Recording', 'RecEncoder');
        if (availableEncoders.length > 0)
            return availableEncoders.filter(e => e !== "none") as Encoder[]
    }

    return null
}