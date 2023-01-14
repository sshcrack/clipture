import { RegManMain } from '@general/register/main';
import { getGameInfo } from '@general/tools/game';
import { MainGlobals } from "@Globals/mainGlobals";
import { Storage } from "@Globals/storage";
import DiscordRPC from "discord-rpc";
import { MainLogger } from "src/interfaces/mainLogger";
import { OutCurrentType } from '../obs/core/interface';
import { RecordManager } from "../obs/core/record";

const clientId = MainGlobals.dcClientId

const log = MainLogger.get("Main", "Backend", "Managers", "Discord")
const CHECK_INTERVAL = 10000
DiscordRPC.register(clientId);
export class DiscordManager {
    private static rpc: DiscordRPC.Client
    private static enabled: boolean = undefined
    private static loggedIn = false
    private static loginInterval: NodeJS.Timer;

    static initialize() {
        RecordManager.instance.addRecordListener(e => this.updateRec(e))

        const enabled = Storage.get("discord_rpc", true)
        if (enabled)
            this.enable()
        else
            this.disable()
    }
    private static async updateRec(recording: boolean) {
        const isRec = RecordManager.instance.isRecording()
        if (!isRec)
            return this.update(recording, null)

        const curr = await RecordManager.instance.getCurrent()
        return this.update(recording, curr)
    }

    private static async update(recording: boolean, out: OutCurrentType) {
        log.silly("Update", recording, "enabled: ", this.enabled, "rpc", !!this.rpc, "LoggedIn", this.loggedIn)
        if (!this.enabled || !this.rpc || !this.loggedIn)
            return

        const generalInfo = {
            buttons: [{
                label: "Learn more",
                url: MainGlobals.baseUrl
            }],
            instance: false,
            largeImageText: "Clipture",
            largeImageKey: "logo",
            details: "Waiting for a game to record..."
        } as DiscordRPC.Presence

        if (!recording) {
            log.info("Setting activity", generalInfo)
            return this.rpc.setActivity(generalInfo)
        }

        const { game, videoName } = out ?? {}
        const gameName = out ? getGameInfo(game, videoName)?.gameName : null

        const startTime = RecordManager.instance.getRecordStart()
        const recordJson = {
            ...generalInfo,
            smallImageText: "Recording...",
            details: "Recording...",
            state: gameName ?? "Unknown Game",
            smallImageKey: "recording",
            startTimestamp: startTime,
        }

        log.info("Setting activity", recordJson)
        this.rpc.setActivity(recordJson)
    }

    static async enable() {
        log.info("Enabling...")
        if (!this.rpc)
            this.rpc = new DiscordRPC.Client({ transport: "ipc" })

        let isReady = false
        Storage.set("discord_rpc", true)
        const readyCallback = async () => {
            this.loggedIn = true;
            isReady = true;

            log.info("RPC is logged in.")
            this.updateRec(RecordManager.instance.isRecording())

            if (this.loginInterval) {
                console.log("Logged in, clearing")
                clearInterval(this.loginInterval)
                this.loginInterval = null
            }
        }

        this.rpc.on("ready", readyCallback)

        for (let i = 0; i < 10; i++) {
            await this.rpc.login({ clientId })
                .then(() => isReady = true)
                .catch(() => log.log(`Could not login. Retrying (${i + 1}/10)...`))
            if (isReady) {
                log.log("Ready. Starting...")
                break;
            }
        }

        if (!isReady) {
            log.error("Could not enable discord rpc. Adding check interval.")
            if (this.loginInterval) {
                console.log("Logged in, clearing")
                clearInterval(this.loginInterval)
                this.loginInterval = null
            }

            this.loginInterval = setInterval(async () => {
                if (this.loggedIn) {
                    console.log("Logged in, clearing")
                    clearInterval(this.loginInterval)
                    return this.loginInterval = null
                }

                this.rpc = new DiscordRPC.Client({ transport: "ipc" })
                this.rpc.on("ready", readyCallback)

                await this.rpc.login({ clientId })
                    .then(() => {
                        console.log("Could login, clearing interval")
                        if (this.loginInterval) {
                            console.log("Logged in, clearing")
                            clearInterval(this.loginInterval)
                            this.loginInterval = null
                        }
                    })
                    .catch(() => { /**/ })
            }, CHECK_INTERVAL)
        }
        this.enabled = true
        this.updateRec(RecordManager.instance.isRecording())

    }

    static disable() {
        log.info("Disabling...")
        const prev = this.loggedIn

        if (this.loginInterval) {
            console.log("Logged in, clearing")
            clearInterval(this.loginInterval)
            this.loginInterval = null
        }
        this.loggedIn = false
        this.enabled = false

        Storage.set("discord_rpc", false)
        if (!this.rpc || !prev)
            return

        this.rpc.destroy()
        this.rpc = undefined
    }

    static register() {
        RegManMain.onPromise("discord_get", async () => Storage.get("discord_rpc", true))
        RegManMain.onPromise("discord_set", async (_, e) => e ? this.enable() : this.disable())
    }
}