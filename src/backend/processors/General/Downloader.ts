import crypto from "crypto";
import fs, { WriteStream } from 'fs';
import got from 'got/dist/source';
import Request, { Progress } from 'got/dist/source/core';
import path from "path";
import { MainLogger } from '../../../interfaces/mainLogger';
import { AdditionalOptions, ProcessEventEmitter } from '../events/Processor';


const logger = MainLogger.get("InstallManager", "base", "Downloader")
export class Downloader extends ProcessEventEmitter {
    public options: DownloaderOptions;

    constructor(options: DownloaderOptions) {
        super(options);
        this.options = options;
    }

    public async run() {
        const { url: urlGetter, destination: destGetter, messages, overwrite, sha } = this.options
        const url = typeof urlGetter === "string" ? urlGetter : urlGetter();
        const destination = typeof destGetter === "string" ? destGetter : destGetter();

        logger.info(messages.downloading)


        const { headers } = await got.head(url)
        const{ "content-length": ContentLength } = headers ?? {}
        const exists = fs.existsSync(destination)
        const hasSameSize = ContentLength && exists && fs.statSync(destination).size === parseInt(ContentLength)
        if (!overwrite && exists && hasSameSize) {
            logger.info(`File ${destination} already exists. Skipping download.`)
            this.emit("progress", { percent: 100, status: "File already exists. Skipping." })
            return;
        }


        const dirName = path.dirname(destination)
        if (!fs.existsSync(dirName))
            fs.mkdirSync(dirName, { recursive: true })


        logger.info(`Downloading ${url} to ${destination}`)
        let writeStream: WriteStream
        const generateDownload = (retryStream: Request): Promise<void> => {
            return new Promise(resolve => {
                const stream =
                    retryStream ??
                    got.stream(url)

                if (writeStream)
                    writeStream.destroy()

                writeStream = fs.createWriteStream(destination);

                stream.pipe(writeStream)

                stream.once("retry", (_, _1, createReadStream) => {
                    logger.warn("Connection aborted, retrying...")
                    generateDownload(createReadStream ? createReadStream() : null);
                })

                stream.on("downloadProgress", (prog: Progress) => {
                    this.emit("progress", {
                        status: messages.downloading,
                        percent: prog.percent,
                    })
                })

                stream.once("end", () => resolve());
            });
        }

        await generateDownload(null);
        if(!sha)
            return;

        logger.info("Validating file using sha1 (and creating read stream)")
        //TODO add this to top function

        const readStream = fs.createReadStream(destination)
        const digest = crypto.createHash('sha1');
        digest.setEncoding("hex")

        logger.debug("Piping digest")
        readStream.pipe(digest);
        await new Promise<void>(resolve => {
            readStream.on("end", () => resolve())
        });

        digest.end();
        const fileSha = digest.read();
        logger.debug("File-SHA:", destination, "Expected:", sha, "Same:", fileSha === sha)

        if(fileSha === sha)
            return;


        throw new Error(`File ${destination} has incorrect sha file sha: ${fileSha} expected: ${sha}`)
    }
}

export interface DownloaderOptions extends AdditionalOptions {
    url: string | (() => string),
    destination: string | (() => string),
    sha?: string;
    messages: {
        /**E.g. Downloading modpack... */
        downloading: string
    }
}