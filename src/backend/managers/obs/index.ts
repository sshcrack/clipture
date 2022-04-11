import { Globals } from '../../../Globals';
import { existsProm } from '../../../backend/tools/fs';
import { LockManager } from '../lock';
import got from "got"
import { getOBSExecutable, getOBSInfoUrl, getOBSPath, getOBSTempZip, getOBSVersion, getOBSVersionFile } from './tool';
import { OBSReleaseResponse } from './interface';
import { Downloader } from '../../../backend/processors/General/Downloader';
import { Unpacker } from '../../../backend/processors/General/Unpacker';
import { ProcessEventEmitter } from '../../../backend/processors/events/Processor';

export class OBSManager {
    private static _instance = new OBSManager();

    static get instance(): OBSManager {
        return this._instance;
    }

    public async install() {
        const { instance } = LockManager
        await instance.waitTillReleased()
        const supportedVersion = Globals.obsVersion

        const installed = await this.isInstalled()
        const latest = await this.hasLatest(supportedVersion)

        if (installed && latest)
            return

        instance.lock({
            percent: 0,
            status: "Getting download url..."
        })

        const url = getOBSInfoUrl(supportedVersion);
        const jsonRes = await got(url)
            .json<OBSReleaseResponse>()

        const arch = process.arch === "x64" ? "x64" : "x86"
        const asset = jsonRes
            .assets
            .find(({ name }) =>
                name.includes(".zip") &&
                name.includes("win") &&
                name.includes(arch)
            )

        if(!asset)
            throw new Error("Architecture not supported")


        const downloader = new Downloader({
            url: asset.browser_download_url,
            destination: getOBSTempZip(),
            overwrite: true,
            messages: {
                downloading: "Downloading OBS...",
            }
        })

        const unpacker = new Unpacker({
            src: getOBSTempZip(),
            destination: getOBSPath(),
            messages: {
                extracting: "Extracting OBS...",
            },
            overwrite: true,
            deleteExistent: true
        })

        await ProcessEventEmitter.runMultiple([ downloader, unpacker ], p => {
            instance.updateListeners(p)
        })

        instance.unlock({
            percent: 100,
            status: "OBS installed."
        })
    }

    public isInstalled() {
        const filePath = getOBSVersionFile()
        const executable = getOBSExecutable()

        return existsProm(filePath) && existsProm(executable)

    }

    public async hasLatest(latest: string) {
        const installed = await this.isInstalled()
        if (!installed)
            return false

        const version = await getOBSVersion()
        return version && version === latest
    }
}