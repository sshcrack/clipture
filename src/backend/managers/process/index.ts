import { RegManMain } from '@general/register/main';
import { MainGlobals } from '@Globals/mainGlobals';
import { MainLogger } from 'src/interfaces/mainLogger';
import { WindowInformation } from '../obs/Scene/interfaces';

export type ProcessManagerCallback = (process: WindowInformation[]) => void

const log = MainLogger.get("Backend", "Managers", "Process")
export class ProcessManager {
    static readonly UPDATE_INTERVAL = 1000
    private static prevProcesses = [] as WindowInformation[]
    private static listeners = [] as ProcessManagerCallback[]
    private static initialized = false
    private static shouldExit = false

    static register() {
        if (this.initialized)
            return

        this.updateLoop()
        RegManMain.onPromise("process_available_windows", (_, game) => this.getAvailableWindows(game))
        this.initialized = true
    }

    static exit() {
        this.shouldExit = true
        this.initialized = false
    }

    static addUpdateListener(listener: ProcessManagerCallback) {
        this.listeners.push(listener)
    }

    private static timeout(ms: number) {
        return new Promise<void>(resolve => setTimeout(() => resolve(), ms));
    }

    static async updateLoop() {
        log.info("Initializing update loop...")
        while (!this.shouldExit) {
            await this.timeout(1000)
            const curr = await this.getAvailableWindows(true)
                .catch(e => {
                    log.error("Failed to get available windows", e)
                    return undefined
                }) as WindowInformation[]

            if(!curr)
                continue;

            const diff = [
                // New processes
                ...(curr.filter(e =>
                    !this.prevProcesses.some(f => f.pid === e.pid)
                    || this.prevProcesses.some(f => f.pid === e.pid && f.focused !== e.focused)
                ) as WindowInformation[]),

                // Closed processes
                ...(this.prevProcesses.filter(e =>
                    !curr.some(f => f.pid === e.pid)
                ) as WindowInformation[])
            ].filter((e, i, a) => a.findIndex(f => f.pid === e.pid) === i)

            if (diff.length > 0) {
                this.listeners.map(e => e(diff))
                RegManMain.send("process_update", this.prevProcesses, diff)
            }

            this.prevProcesses = curr
        }
    }

    static async getAvailableWindows(game?: boolean) {
        const execa = (await import("execa")).execa
        const out = await execa(MainGlobals.nativeMngExe, [game ? "game" : ""])
        const stdout = out.stdout
        try {
            const res = JSON.parse(stdout) as WindowInformation[]
            return res
        } catch (e) {
            throw [new Error(`Stdout: ${out.stdout} Stderr: ${out.stderr} Code: ${out.exitCode}`), e]
        }
    }
}