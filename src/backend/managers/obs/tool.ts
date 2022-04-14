import path from "path";

export function getOBSDataPath() {
    return path.join(__dirname, "../../osn-data").replace("app.asar", "app.asar.unpacked");
}

export function getOBSWorkingDir() {
    return path.join(__dirname, "../../node_modules/@streamlabs/obs-studio-node").replace("app.asar", "app.asar.unpacked")
}

export function getOBSBinary() {
    return path.join(getOBSWorkingDir(), "obs64.exe");
}