import { existsProm } from '@backend/tools/fs';
import { UseToastOptions } from '@chakra-ui/react';
import { RegManMain } from '@general/register/main';
import { MainGlobals } from '@Globals/mainGlobals';
import { Storage } from '@Globals/storage';
import { readFile, writeFile } from 'fs/promises';
import got from "got";
import path from 'path';
import { MainLogger } from 'src/interfaces/mainLogger';
import { AuthManager } from '../auth';
import { isDetectableGameInfo } from '../obs/core/tools';
import { DetectableGame, MonitorDimensions, WindowInformation } from '../obs/Scene/interfaces';
import { GeneralGame } from './interface';

export type ProcessManagerCallback = (info: WindowInformation[]) => void

const log = MainLogger.get("Backend", "Managers", "Game")
export class GameManager {
    static readonly UPDATE_INTERVAL = 1000
    static readonly CACHE_INVALIDATE = 1000 * 15

    private static prevProcesses = [] as WindowInformation[]
    private static listeners = [] as ProcessManagerCallback[]
    private static excludeGames = [] as GeneralGame[]
    private static includedGames = [] as GeneralGame[]

    private static detectableGames: DetectableGame[] = null

    private static initialized = false
    private static shouldExit = false
    private static hasUpdateLoop = false;

    // Called at obs/index.
    static addUpdateLoop() {
        if (this.hasUpdateLoop)
            return

        this.updateLoop()
        this.hasUpdateLoop = true
        AuthManager.addOfflineChangeListener(offline => {
            if (offline)
                return

            this.detectableGames = null
        })
    }


    static async getDetectableGames(cache?: boolean) {
        if (!this.detectableGames)
            this.detectableGames = await this.refreshDetectableGames(false, cache)

        return this.detectableGames
    }

    private static getCachePath() {
        return path.join(Storage.get("clip_path"), "detectable_games.json")
    }

    public static hasCache() {
        const cachePath = this.getCachePath()

        return existsProm(cachePath)
    }


    private static async refreshDetectableGames(showToast = true, useCache = true) {
        const cachePath = this.getCachePath()
        if (AuthManager.isOffline()) {
            if (!(await existsProm(cachePath)))
                return log.warn("No cache for detectable games and in offline mode")

            if (!useCache)
                return log.warn("Usage of cache disabled and in offline mode.")

            const cacheRaw = await readFile(cachePath, "utf-8")
            const cache = JSON.parse(cacheRaw)

            return cache
        }

        return got(MainGlobals.gameUrl).then(e => JSON.parse(e.body))
            .catch(e => {
                log.warn("Could not fetch detectable games", e)
                if (showToast)
                    RegManMain.send("toast_show", {
                        title: "Warning",
                        description: "Could not fetch detectable games, please check your internet connection or click the button to manually start recording.",
                        status: "warning"
                    } as UseToastOptions)
                return []
            })
            .then(async e => {
                console.log("Saving detectable games to cache...")
                await writeFile(cachePath, JSON.stringify(e))
                return e
            })
    }

    static save() {
        log.info("Saving included and excluded games")
        Storage.set("games_include", this.includedGames)
        Storage.set("games_exclude", this.excludeGames)
        writeFile(this.getCachePath(), JSON.stringify(this.detectableGames))
    }

    static register() {
        if (this.initialized)
            return

        RegManMain.onPromise("game_detectable_games", () => this.getDetectableGames())
        RegManMain.onPromise("game_curr_detectable", async () => {
            const available = await this.getAvailableWindows(true)
            const detectable = await this.getDetectableGames()

            return available?.filter(e => detectable.some(x => isDetectableGameInfo(x, e)))
        })
        RegManMain.onPromise("game_available_windows", (_, game) => this.getAvailableWindows(game))

        RegManMain.onPromise("game_add_exclude", async (_, game) => this.addExclude(game))
        RegManMain.onPromise("game_remove_exclude", async (_, game) => this.removeExclude(game))
        RegManMain.onPromise("game_list_exclude", async () => this.getExcludeList())
        RegManMain.onPromise("game_set_exclude", async (_, toSet) => this.setExclude(toSet))


        RegManMain.onPromise("game_add_include", async (_, game) => this.addInclude(game))
        RegManMain.onPromise("game_remove_include", async (_, game) => this.removeInclude(game))
        RegManMain.onPromise("game_list_include", async () => this.getIncludeList())
        RegManMain.onPromise("game_set_include", async (_, toSet) => this.setInclude(toSet))

        RegManMain.onPromise("game_has_cache", () => this.hasCache())

        this.excludeGames = Storage.get("games_exclude", [])
        this.includedGames = Storage.get("games_include", [])
        this.initialized = true
    }


    static winInfoExcluded(info: WindowInformation) {
        return this.getExcludeList().some(x => {
            if (x.type === "window")
                return JSON.stringify(x.game) === JSON.stringify(info)

            return isDetectableGameInfo(x.game, info)
        })
    }

    private static hasExcluded(info: GeneralGame) {
        return this.excludeGames.some(e => JSON.stringify(e) === JSON.stringify(info))
    }

    static getExcludeList() {
        return this.excludeGames
    }

    static setExclude(info: GeneralGame[]) {
        this.excludeGames = info
        this.save()
    }

    static addExclude(info: GeneralGame) {
        if (this.hasExcluded(info))
            return

        this.excludeGames.push(info)
        this.save()
    }

    static removeExclude(info: GeneralGame) {
        if (!this.hasExcluded(info))
            return

        this.excludeGames = this.excludeGames?.filter(e => JSON.stringify(e) !== JSON.stringify(info))
        this.save()
    }



    private static hasIncluded(info: GeneralGame) {
        return this.includedGames.some(e => JSON.stringify(e) === JSON.stringify(info))
    }

    static getIncludeList() {
        return this.includedGames
    }

    static setInclude(info: GeneralGame[]) {
        this.includedGames = info
        this.save()
    }

    static addInclude(info: GeneralGame) {
        if (this.hasIncluded(info))
            return

        this.includedGames.push(info)
        this.save()
    }

    static removeInclude(info: GeneralGame) {
        if (!this.hasExcluded(info))
            return

        this.includedGames = this.includedGames?.filter(e => JSON.stringify(e) !== JSON.stringify(info))
        this.save()
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
        let reportedError = false
        while (!this.shouldExit) {
            try {
                await this.timeout(1000)
                if (this.shouldExit)
                    break

                const curr = await this.getAvailableWindows(true)
                    .then(e => {
                        reportedError = false
                        return e;
                    })
                    .catch(e => {
                        !reportedError && log.error("Failed to get available windows", e)
                        reportedError = true
                        return undefined
                    }) as WindowInformation[]

                const diff = [
                    // New processes (either completely new or focused another window)
                    ...(curr?.filter(e =>
                        !this.prevProcesses.some(f => f.pid === e.pid)
                        || this.prevProcesses.some(f => f.pid === e.pid && f.focused !== e.focused)
                    ) as WindowInformation[]),

                    // Closed processes
                    ...(this.prevProcesses?.filter(e =>
                        !curr.some(f => f.pid === e.pid)
                    ) as WindowInformation[])
                ]?.filter((e, i, a) => a?.findIndex(f => f.pid === e.pid) === i)

                if (diff.length > 0) {
                    this.listeners.map(e => e(diff))
                    RegManMain.send("game_update", this.prevProcesses, diff)
                }

                this.prevProcesses = curr
            } catch (e) {
                log.error("Game Update Loop Error", e)
            }
        }
    }

    static async getAvailableWindows(game?: boolean) {
        const execa = (await import("execa")).execa
        const out = execa(MainGlobals.nativeMngExe, [game ? "game" : ""])
        try {
            const outProc = await out;
            const stdout = outProc.stdout
            const res = JSON.parse(stdout) as WindowInformation[]
            return res
        } catch (error) {
            throw new Error(`Errno: ${error.errno} command: ${error.command} stdout: ${error.stdout} err: ${error.stderr}`)
        }
    }

    static async getMonitorDimensions(hwnd: number) {
        const execa = (await import("execa")).execa
        const out = execa(MainGlobals.nativeMngExe, ["monitor", hwnd.toFixed(0)])
        try {
            const outProc = await out;
            const stdout = outProc.stdout
            const res = JSON.parse(stdout) as MonitorDimensions
            if (!res || isNaN(res.width) || isNaN(res.height) || isNaN(res.index))
                throw { errno: -999, command: `monitor ${hwnd.toFixed(0)}`, stdout: res, stderr: outProc.stderr }
            return res
        } catch (error) {
            throw new Error(`Errno: ${error.errno} command: ${error.command} stdout: ${JSON.stringify(error.stdout)} err: ${error.stderr}`)
        }
    }

    static async getIconPath(pid: number) {
        if (!pid)
            return

        const execa = (await import("execa")).execa
        const out = execa(MainGlobals.nativeMngExe, ["icon", pid.toString()])
        try {
            const outProc = await out;
            if (out.exitCode !== 0)
                throw new Error(`Could not run command nativeMng with pid ${pid}`)

            return outProc.stdout.split("\\\\").join("\\").split('"').join("")
        } catch (error) {
            throw new Error(`Errno: ${error.errno} command: ${error.command} stdout: ${error.stdout} err: ${error.stderr}`)
        }
    }
}