import { RegManMain } from '@general/register/main';
import psList, { ProcessDescriptor } from 'ps-list';
import { MainLogger } from 'src/interfaces/mainLogger';

export type ProcessManagerCallback = (process: ProcessDescriptor[]) => void

const log = MainLogger.get("Backend", "Managers", "Process")
export class ProcessManager {
    static readonly UPDATE_INTERVAL = 1000
    private static prevProcesses = [] as ProcessDescriptor[]
    private static initialized = false
    private static shouldExit = false

    static initialize() {
        if (this.initialized)
            return

        this.updateLoop()
        this.initialized = true
    }

    static timeout(ms: number) {
        return new Promise<void>(resolve => setTimeout(() => resolve(), ms));
    }

    static exit() {
        this.shouldExit = true
        this.initialized = false
    }

    static async updateLoop() {
        log.info("Initializing update loop...")
        while (!this.shouldExit) {
            await this.timeout(1000)
            const curr = await psList()

            const diff = curr.filter(e => !this.prevProcesses.some(f => f.pid === e.pid))
            if (diff.length > 0)
                RegManMain.send("process_create", diff)

            this.prevProcesses = curr
        }
    }
}