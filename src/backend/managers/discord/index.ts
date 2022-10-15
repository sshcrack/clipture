import { RegManMain } from '@general/register/main';
import { getGameInfo } from '@general/tools/game';
import { MainGlobals } from "@Globals/mainGlobals";
import { Storage } from "@Globals/storage";
import DiscordRPC from "discord-rpc";
import { MainLogger } from "src/interfaces/mainLogger";
import { RecordManager } from "../obs/core/record";

const clientId = MainGlobals.dcClientId

const log = MainLogger.get("Main", "Backend", "Managers", "Discord")
DiscordRPC.register(clientId);
export class DiscordManager {
    private static rpc: DiscordRPC.Client
    private static enabled: boolean = undefined
    private static loggedIn = false

    static initialize() {
        RecordManager.instance.addRecordListener(e => this.update(e))

        const enabled = Storage.get("discord_rpc", true)
        if (enabled)
            this.enable()
        else
            this.disable()
    }

    private static async update(recording: boolean) {
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

        const { game, videoName } = await RecordManager.instance.getCurrent() ?? {}
        const { gameName } = getGameInfo(game, videoName)

        const startTime = RecordManager.instance.getRecordStart()
        const recordJson = {
            ...generalInfo,
            smallImageText: "Recording...",
            details: "Recording...",
            state: gameName,
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
        this.rpc.on("ready", () => { this.loggedIn = true; isReady = true; console.log("Ready") })
        for (let i = 0; i < 10; i++) {
            await this.rpc.login({ clientId })
                .catch(() => log.log(`Could not login. Retrying (${i + 1}/10)...`))
                .then(() => isReady = true)
            if (isReady)
                break;
        }

        this.enabled = true
        this.update(RecordManager.instance.isRecording())
    }

    static disable() {
        log.info("Disabling...")
        const prev = this.loggedIn

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