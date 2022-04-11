import fs from "fs";
import JSZip from "jszip";
import path from 'path';
import unpacker from "unpacker-with-progress";
import { MainLogger } from '../../../interfaces/mainLogger';
import { AdditionalOptions, ProcessEventEmitter } from '../events/Processor';


const logger = MainLogger.get("InstallManager", "processors", "Unpacker")

export class Unpacker extends ProcessEventEmitter {
    public options: UnpackerOptions;

    constructor(options: UnpackerOptions) {
        super(options);

        this.options = options;
    }

    public async run() {
        logger.info(this.options.messages.extracting)
        this.emit("progress", { percent: 0, status: `Extracting ${this.options.messages.extracting}...` })

        const { destination, src, messages } = this.options;
        const { overwrite } = this.options;

        if(!fs.existsSync(destination))
            fs.mkdirSync(destination, { recursive: true})

        if(!fs.existsSync(src))
            throw new Error(`File ${src} does not exist. (Unpacker)`)
        if (this.options.deleteExistent) {
            logger.debug("Deleting existent files from", src)
            const file = fs.readFileSync(src)

            const zip = new JSZip()
            await zip.loadAsync(file)

            const files = Object.values(zip.files)
                .map(e => e.name)

            files.forEach(e => {
                const dir = path.dirname(e)

                const absFile = path.join(destination, e)
                const absDir = path.join(destination, dir)


                const check = [absDir, absFile ]
                for (const el of check) {
                    const exists = fs.existsSync(el);

                    if (e === "" || el === destination || el === destination + "/" || !exists)
                        return;

                    logger.debug("Deleting", absFile)
                    fs.rmSync(el, { recursive: true, force: true })
                    break;
                }

            })
        }


        logger.debug("Running unpacker")
        await unpacker(src, destination, {
            resume: overwrite,
            onprogress: stats =>
                this.emit("progress", {
                    percent: stats.percent,
                    status: messages.extracting + ` (${stats.unpacked} / ${stats.totalEntries})`
                })
        })

        logger.debug("Done.")
    }
}

export interface UnpackerOptions extends AdditionalOptions {
    src: string,
    destination: string,
    deleteExistent?: boolean,
    messages: {
        /** Extracting modpack... => Extracting modpack... (5/10) */
        extracting: string
    }
}