import { app } from 'electron';
import path from "path"
import fs from "fs/promises"
import { existsProm } from '../../../backend/tools/fs';
import { MainGlobals } from '../../../Globals/mainGlobals';

export function getOBSPath(): string {
    return path.join(app.getPath("userData"), "obs");
}

export function getOBSVersionFile(): string {
    return path.join(getOBSPath(), "version.txt");
}

export function getOBSExecutable() {
    const arch = process.arch === "x64" ? "64" : "32"
    return path.join(getOBSPath(), "bin",`${arch}bit`, `obs${arch}.exe`);
}

export function getOBSInfoUrl(version: string) {
    return `https://api.github.com/repos/obsproject/obs-studio/releases/tags/${version}`;
}

export function getOBSTempZip() {
    return MainGlobals.getTempDir()
}

export async function getOBSVersion(): Promise<string | undefined> {
    const file = getOBSVersionFile()

    const exists = await existsProm(file)
    if(!exists)
        return undefined

    return await fs.readFile(file, "utf-8")
}