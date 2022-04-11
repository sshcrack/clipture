import { MainLogger } from '../../../interfaces/mainLogger';
import EventEmitter from 'events';
import TypedEmitter from "typed-emitter";
import { MessageEvents, ProgressEvent } from './interface';


const logger = MainLogger.get("InstallManager", "Processor")
class ProcessorEventEmitterClass extends (EventEmitter as new () => TypedEmitter<MessageEvents>) {
    public id: string
    public options: AdditionalOptions

    constructor(options: AdditionalOptions) {
        super()
        this.options = options;
    }

    private processProm: Promise<void>;

    public startProcessing(): Promise<void> {
        if (this.processProm)
            return this.processProm;

        this.processProm = new Promise((resolve, reject) => {

            this.on("end", (error) => {
                if (error)
                    return reject(error);

                resolve();
            })

            this.run()
                .then(() => this.emit("end"))
                .catch(e => this.emit("end", e))
        });

        return this.processProm;
    }

    public async run(): Promise<unknown> {
        logger.error("Processor Event Emitter not implemented. Caution")

        return undefined;
    }

    static async runMultiple(emitters: ProcessorEventEmitterClass[], onProgress: ProgressEvent, maxDigits = 2) {
        logger.info("Running multiple emitters")
        const length = emitters.length;

        for (let i = 0; i < length; i++) {
            const emitter = emitters[i];
            const currMultiplier = 1 / length;
            const alreadyDone = i * currMultiplier;

            emitter.on("progress", ({ percent, status }) => {
                const totalPercent = percent * currMultiplier + alreadyDone;
                const multiplier = Math.pow(10, maxDigits);

                const rounded = Math.round(totalPercent * multiplier) / multiplier
                onProgress({
                    percent: rounded,
                    status
                })
            })

            logger.debug(i, "/", length, emitter.constructor.name)
            const err = await emitter.startProcessing()
                .then(() => undefined)
                .catch(e => new Error(e));

            if(err)
                throw err;
        }
    }
}

export abstract class ProcessEventEmitter extends ProcessorEventEmitterClass {
    public abstract run(): Promise<unknown>;
}

export interface AdditionalOptions {
    overwrite: boolean,
}