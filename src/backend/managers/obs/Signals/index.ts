import { NodeObs as notTypedOBS } from "@streamlabs/obs-studio-node";
import { IOBSOutputSignalInfo, NodeObs } from "src/types/obs/obs-studio-node";
import { Subject } from "rxjs"
import { first } from "rxjs/operators";

const NodeObs: NodeObs = notTypedOBS
export class SignalsManager {
    private static signals = new Subject<IOBSOutputSignalInfo>()
    static initialize() {
        this.connectOutputSignals()
    }

    static getNextSignalInfo() {
        return new Promise<IOBSOutputSignalInfo>((resolve, reject) => {
            this.signals.pipe(first()).subscribe(signalInfo => resolve(signalInfo));
            setTimeout(() => reject('Output signal timeout'), 30000);
        });
    }

    private static connectOutputSignals() {
        NodeObs.OBS_service_connectOutputSignals((signalInfo: IOBSOutputSignalInfo) => {
            this.signals.next(signalInfo);
        });
    }
}