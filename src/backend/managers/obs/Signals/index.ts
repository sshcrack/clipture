import { Subject } from "rxjs";
import { first } from "rxjs/operators";
import { getLocalizedT } from 'src/locales/backend_i18n';
import type { IAdvancedRecording, ISimpleRecording, EOutputSignal} from "@streamlabs/obs-studio-node"

export class SignalsManager {
    private static signals = new Subject<EOutputSignal>()

    static getNextSignalInfo() {
        return new Promise<EOutputSignal>((resolve, reject) => {
            const t = getLocalizedT("backend", "obs")
            this.signals.pipe(first()).subscribe(signalInfo => resolve(signalInfo));
            setTimeout(() => reject(t("signal_timeout")), 30000);
        });
    }

    public static reconnectSignals(recorder: IAdvancedRecording | ISimpleRecording) {
        recorder.signalHandler = (signalInfo: EOutputSignal) => {
            this.signals.next(signalInfo);
        };
    }
}