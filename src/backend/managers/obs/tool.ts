import { MainGlobals } from "@Globals/mainGlobals";
import { getWebpackDir } from "@backend/tools/fs";
import type { VideoEncoderFactory as EncoderFactory } from "@streamlabs/obs-studio-node";
import fs from "fs/promises";
import path from "path";
import { MainLogger } from "src/interfaces/mainLogger";
import { AvailableEncoders, Encoder } from './types';

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

let packageFile = null as string;
export async function importOBS() {
    console.log("OBS Require path is", obsRequirePath, "split", obsRequirePath.split("\\").join("/"))
    const packagePath = path.join(obsRequirePath, "package.json")
    if (!packageFile) {
        packageFile = await fs.readFile(packagePath, "utf-8")
        const parsed = JSON.parse(packageFile)
        log.info("OBS Version is", parsed.version)
    }

    const prom = packaged ? eval(`import("${"file:///" + path.join(obsRequirePath, "index.js").split("\\").join("/")}")`) : eval(`import("${obsRequirePath}")`)
    const res = await prom as typeof import("@streamlabs/obs-studio-node")
    log.info("Imported OBS", Object.keys(res ?? {})?.length, "elements")
    return res
}

export function getEncoders({ VideoEncoderFactory }: { VideoEncoderFactory: typeof EncoderFactory }) {
    const availableEncoders = VideoEncoderFactory.types()
    if (availableEncoders.length > 0)
        return availableEncoders.filter(e => AvailableEncoders.includes(e as Encoder)) as Encoder[]

    return null
}

// default, slow, medium, fast