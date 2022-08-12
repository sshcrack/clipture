import { Progress } from "@backend/processors/events/interface";
import { ProcessEventEmitter } from "@backend/processors/events/Processor";
import { Downloader } from "@backend/processors/General/Downloader";
import { Unpacker } from "@backend/processors/General/Unpacker";
import { existsProm } from "@backend/tools/fs";
import { RegManMain } from "@general/register/main";
import { MainGlobals } from "@Globals/mainGlobals";
import crypto from "crypto";
import { app } from "electron";
import fs from "fs/promises";
import got from "got";
import path from "path";
import { MainLogger } from "src/interfaces/mainLogger";
import { v4 as uuid } from "uuid";
import { LockManager } from "../lock";
import { importOBS } from "../obs/tool";

const { ffmpegExe, ffprobeExe, obsRequirePath, baseUrl, nativeMngExe } = MainGlobals

const nativeMngUrl = `${baseUrl}/native_mng.exe`
const nativeMngHash = `${baseUrl}/native_mng.exe.hash`
const ffmpegUrl = `${baseUrl}/ffmpeg.exe`
const ffmpegHash = `${baseUrl}/ffmpeg.exe.hash`
const ffprobeUrl = `${baseUrl}/ffprobe.exe`
const ffprobeHash = `${baseUrl}/ffprobe.exe.hash`
const downloadUrl = `${baseUrl}/obs-studio-node.zip`
const hashUrl = `${baseUrl}/obs-studio-node.zip.hash`
const hashFile = path.join(obsRequirePath, "hash")

const validateFile = async (exe: string, hashUrl: string) => {
    const exists = await existsProm(exe)
    log.info("Checking for", exe, exists)
    if (!exists)
        return false
    log.info("Getting current hash")
    const currHash = crypto.createHash("sha256").update(await fs.readFile(exe)).digest("hex")
    log.info(`Getting online ${exe} hash`)
    const onlineHash = await got(hashUrl).then(e => e.body)
    log.info("Got info", exe)
    return currHash === onlineHash
}

const downloadFile = async (name: string, url: string, dest: string, onProgress: (prog: Progress) => unknown) => {
    const downloader = new Downloader({
        destination: dest,
        url: url,
        overwrite: true,
        messages: {
            downloading: `Downloading ${name}...`
        }
    })

    downloader.addListener("progress", e => onProgress(e))
    return downloader.startProcessing()
}

const log = MainLogger.get("Backend", "Managers", "Prerequisites")
export class Prerequisites {
    private static obsInstalling = false
    private static initializing = false

    static register() {
        RegManMain.onPromise("prerequisites_initialize", () =>
            this.initialize(p => RegManMain.send("prerequisites_update", p))
        )
        RegManMain.onPromise("prerequisites_is_valid", () => this.validate())
    }

    static async validate() {
        const checksProm = {
            ffmpeg: validateFile(ffmpegExe, ffmpegHash),
            ffprobe: validateFile(ffprobeExe, ffprobeHash),
            native_mng: validateFile(nativeMngExe, nativeMngHash),
            obs: this.validateOBS()
        }

        log.info("Validating...")
        const res = await Promise.all(Object.values(checksProm)).catch(e => {
            log.error("Prerequisites error:")
            log.error(e)
            return [false]
        })

        const keys = Object.keys(checksProm) as (keyof typeof checksProm)[]
        const anyErrors = res.some(e => !e)
        return {
            valid: !anyErrors,
            errors: keys.filter((_, i) => !res[i])
        }
    }

    private static getOBSHash() {
        log.info("Getting OBS hash...")
        return got(hashUrl).then(e => e.body)
    }

    static async initialize(onProgress: (prog: Progress) => unknown) {
        if (this.initializing)
            return log.warn("Already initializing. Skipping.")

        this.initializing = true
        const installMethods = {
            "ffmpeg": (e: (prog: Progress) => unknown) => downloadFile("FFmpeg", ffmpegUrl, ffmpegExe, e),
            "ffprobe": (e: (prog: Progress) => unknown) => downloadFile("FFprobe", ffprobeUrl, ffprobeExe, e),
            "obs": (e: (prog: Progress) => unknown) => this.installOBS(e),
            "native_mng": (e: (prog: Progress) => unknown) => downloadFile("NativeMng", nativeMngUrl, nativeMngExe, e)
        }

        const { errors, valid } = await this.validate()
        if (valid) {
            this.initializing = false
            return
        }

        const locked = LockManager.instance.isLocked()
        if (locked)
            throw new Error("Could not acquire lock.")

        LockManager.instance.lock({
            percent: 0,
            status: "Initializing prerequisites..."
        })

        const partPercent = 1 / errors.length
        for (let i = 0; i < errors.length; i++) {
            const name = errors[i]
            const method = installMethods[name]

            log.info(`Running ${name}(${i + 1}/${errors.length})`)
            const error = await method(({ percent, status }) => {
                const prog = {
                    percent: i * partPercent + partPercent * percent,
                    status
                }

                LockManager.instance.updateListeners(prog)
                onProgress(prog)
            })
                .then(() => undefined)
                .catch(e => e)

            if (error) {
                log.error("Could not run method", name, "error is", error)
                LockManager.instance.unlock({ status: "Error installing", percent: 1 })
                throw error
            }
            log.info(name, "is done. Continuing...")
        }
        LockManager.instance.unlock({ status: "Prerequisites installed", percent: 1 })
        log.info("Unlocked. Done installing.")
    }

    static async validateOBS() {
        if (!app.isPackaged)
            return true
        const exists = await existsProm(obsRequirePath)
        log.info("Exists", exists)
        if (!exists)
            return false

        const hashFileExists = await existsProm(hashFile)
        log.info("HashFile", hashFileExists)
        if (!hashFileExists)
            return false

        const hash = await fs.readFile(hashFile, "utf-8")
        const onlineHash = await this.getOBSHash()

        log.info("Local", hash, "Online", onlineHash)
        if (hash !== onlineHash)
            return false

        return await importOBS()
            .then(() => true)
            .catch(e => {
                log.error("Could not import obs", e)
                return false
            })
    }

    private static async installOBS(onProgress: (prog: Progress) => unknown) {
        if (this.obsInstalling) {
            log.warn("Could not install obs as it is already installing")
            return Promise.reject(new Error("OBS is already installing."))
        }

        const installFunc = async () => {
            const tempDir = app.getPath("temp")
            const downloadedFile = path.join(tempDir, uuid() + ".zip")

            const hash = await this.getOBSHash()
            log.info("Adding downloader url: ", downloadUrl, "to", downloadedFile)
            log.info("Adding unpacker src", downloadedFile, "dest", obsRequirePath)

            await ProcessEventEmitter.runMultiple([
                new Downloader({
                    destination: downloadedFile,
                    url: downloadUrl,
                    overwrite: true,
                    messages: {
                        downloading: "Downloading OBS..."
                    }
                }),
                new Unpacker({
                    destination: obsRequirePath,
                    src: downloadedFile,
                    overwrite: true,
                    deleteExistent: true,
                    messages: {
                        extracting: "Extracting OBS..."
                    }
                })
            ], onProgress)

            log.info("Writing hashFile", hashFile, "with hash", hash)
            await fs.writeFile(hashFile, hash)
            log.info("Install func done.")
        }

        await installFunc()
		.finally(() => this.obsInstalling = false)
        log.info("Returning obs install")
    }
}