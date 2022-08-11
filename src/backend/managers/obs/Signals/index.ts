import { IOBSOutputSignalInfo, NodeObs as typedObs } from "src/types/obs/obs-studio-node";
import { Subject } from "rxjs"
import { first } from "rxjs/operators";
import { MainGlobals } from "@Globals/mainGlobals";

const { obsRequirePath} = MainGlobals
export class SignalsManager {
    private static signals = new Subject<IOBSOutputSignalInfo>()
    private static NodeObs: typedObs
    static async initialize() {
        this.NodeObs = (await import(obsRequirePath)).NodeObs
        this.connectOutputSignals()
    }

    static getNextSignalInfo() {
        return new Promise<IOBSOutputSignalInfo>((resolve, reject) => {
            this.signals.pipe(first()).subscribe(signalInfo => resolve(signalInfo));
            setTimeout(() => reject('Output signal timeout'), 30000);
        });
    }

    private static connectOutputSignals() {
        this.NodeObs.OBS_service_connectOutputSignals((signalInfo: IOBSOutputSignalInfo) => {
            this.signals.next(signalInfo);
        });
    }
}