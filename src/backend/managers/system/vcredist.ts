import { app } from 'electron'
import got, { Progress as GotProgress } from 'got'
import { v4 as uuid } from "uuid"
import path from 'path'
import { promisify } from 'node:util';
import stream from 'node:stream';
import fs from "fs"
import { Progress } from '@backend/processors/events/interface'
import { MainLogger } from 'src/interfaces/mainLogger'

const pipeline = promisify(stream.pipeline);
const log = MainLogger.get("Backend", "System", "VCRedist")
export async function checkVCRedist() {
    const execa = (await import("execa")).execa
    const res = await execa(`reg`, ["query", "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\VisualStudio\\14.0\\VC\\Runtimes\\X64"])
        .then(e => e.exitCode === 0)
        .catch(() => false)
    log.silly(`VCRedist is ${res ? "" : "not "}installed`)
    return res
}

export async function installVCRedist(onProgress: (prog: Progress) => unknown) {
    const execa = (await import("execa")).execa

    const RedistUrl = "https://aka.ms/vs/17/release/vc_redist.x64.exe"
    const tempDir = app.getPath("temp")
    const tempFile = path.join(tempDir, `${uuid()}.exe`)

    const outStream = fs.createWriteStream(tempFile)
    const gotStream = got.stream(RedistUrl)

    log.info(`Downloading VCRedist to ${tempFile}...`)
    gotStream.on("downloadProgress", (prog: GotProgress) => {
        onProgress({
            percent: prog.percent * 0.9,
            status: "Downloading VCRedist"
        })
    })

    await pipeline(
        gotStream,
        outStream
    )

    onProgress({
        percent: 0.95,
        status: "Installing VCRedist"
    })

    const RETRIES = 10

    log.info("Installing VCRedist...")
    const initialInstalled = await checkVCRedist()

    for (let i = 0; i < RETRIES; i++) {
        if (initialInstalled)
            break;

        await execa(tempFile, ["/install", "/passive"]).catch(() => false)
        const installed = await checkVCRedist()

        if (installed)
            break;


        log.info("Retrying to install VCRedist (", i + 1, "/", RETRIES, ")")
    }

    log.info("Installed VCRedist.")
}