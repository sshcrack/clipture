import { MessageEvents, ProgressEvent } from './interface';
import { ProcessEventEmitter } from './Processor';
import TypedEmitter from "typed-emitter";
import EventEmitter from 'events';

export class ProcessHandler extends (EventEmitter as new () => TypedEmitter<MessageEvents>){
    private emitters: ProcessEventEmitter[];

    constructor(emitters: ProcessEventEmitter[]) {
        super();
        this.emitters = emitters;
    }

    public async runAll(onProgress: ProgressEvent) {
        const length = this.emitters.length;

        for (let i = 0; i < this.emitters.length; i++) {
            const emitter = this.emitters[i];
            const currMultiplier = i / length;

            emitter.on("progress", ({ percent, status}) =>
                onProgress({
                    percent: percent * currMultiplier,
                    status
                })
            )

            await emitter.startProcessing();
        }
    }
}