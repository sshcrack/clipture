import { moveFile } from '@general/lib/move-file';
import { RegManMain } from '@general/register/main';
import { MainGlobals } from '@Globals/mainGlobals';
import { app, dialog, shell } from 'electron';
import fs from "fs";
import { readFile } from 'fs/promises';
import { glob } from 'glob';
import JSZip from 'jszip';
import path from 'path';
import { MainLogger } from 'src/interfaces/mainLogger';
import si from "systeminformation";
import { promisify } from 'util';
import { v4 as uuid } from "uuid";

const globProm = promisify(glob);
const log = MainLogger.get("Managers", "System", "DebugGatherer")

export class DebugGatherer {
    public static register() {
        RegManMain.onPromise("system_debug_get", () => this.openAndGetDebugFile())
    }

    private static async openAndGetDebugFile() {
        const sourceFile = await this.getDebugFile();

        log.info("Saving debug file, located at", sourceFile)
        const res = await dialog.showSaveDialog(MainGlobals.window, {
            title: "Where should the info be saved?",
            filters: [{
                extensions: ["zip"],
                name: "DebugFile (.zip)"
            }]
        })

        log.debug("Res is", res)
        if (!res)
            return;

        const { filePath } = res
        moveFile(sourceFile, filePath)
        shell.showItemInFolder(filePath)
    }

    public static async getDebugFile() {
        const zip = new JSZip();
        const logDirLocal = app.getPath("logs")
        const pattern = `${logDirLocal.split("\\").join("/")}/**/*.log*`

        log.info("LogInfo pattern", pattern)
        const logFiles = await Promise.all(
            (await globProm(pattern))
                .map(async e => {
                    log.silly("Appending log", e)
                    const content = await readFile(e)
                    const zipPath = path.relative(logDirLocal ?? "", e).split("\\").join("/").split("/").join("__")

                    return [zipPath, content] as [string, Buffer]
                })
        )

        const logDir = zip.folder("logs")
        logFiles.map(e => logDir.file(...e, { binary: true }))

        const mem = await (async () => {
            const { total, free, used } = await si.mem()
            return { total, free, used }
        })()

        const cpu = await (async () => {
            const { manufacturer, brand, virtualization } = await si.cpu()
            const temperature = await si.cpuTemperature();
            return { manufacturer, brand, virtualization, temperature }
        })()

        const gpu = await (async () => {
            const { controllers, displays } = await si.graphics()
            return {
                controllers: controllers.map(({ vendor, model, vram }) => ({ vendor, model, vram })),
                displays: displays.map(({ vendor, model, deviceName, resolutionX, resolutionY }) => ({
                    vendor,
                    model,
                    deviceName,
                    resolution: [resolutionX, resolutionY]
                }
                )),
            }
        })()

        const os = await (async () => {
            const { platform, distro, release } = await si.osInfo()
            return { platform, distro, release }
        })()



        zip.file("cpu.json", JSON.stringify(cpu, null, 2))
        zip.file("mem.json", JSON.stringify(mem, null, 2))
        zip.file("gpu.json", JSON.stringify(gpu, null, 2))
        zip.file("os.json", JSON.stringify(os, null, 2))

        const tempFile = path.join(app.getPath("temp"), uuid() + ".zip")
        return new Promise<string>((resolve, reject) => {
            zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                .pipe(fs.createWriteStream(tempFile))
                .on('finish', function () {
                    resolve(tempFile)
                })
                .on("error", reject);
        });
    }
}