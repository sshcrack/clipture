import { MainGlobals } from "@Globals/mainGlobals";
import { Storage } from "@Globals/storage"
import DiscordRPC from "discord-rpc"
import { MainLogger } from "src/interfaces/mainLogger";
import { RecordManager } from "../obs/core/record";
import { getGameInfo } from '@general/tools/game'

const clientId = MainGlobals.dcClientId

const logger = MainLogger.get("Main", "Backend", "Managers", "Discord")
DiscordRPC.register(clientId);
export class DiscordManager {
    private static rpc: DiscordRPC.Client
    private static enabled: boolean = undefined
    private static loggedIn = false

    static initialize() {
        RecordManager.instance.addRecordListener(e => this.update(e))

        this.enabled = Storage.get("discord_rpc", true)
        if (this.enabled)
            this.enable()
        else
            this.disable()
    }

    private static async update(recording: boolean) {
        if (!this.enabled || !this.rpc || !this.loggedIn)
            return

        logger.info("Updating discord rpc...")
        const generalInfo = {
            buttons: [{
                label: "Learn more",
                url: MainGlobals.baseUrl
            }],
            instance: false,
            largeImageText: "Clipture",
            largeImageKey: "logo",
        } as DiscordRPC.Presence

        if (!recording)
            return this.rpc.setActivity(generalInfo)

        const { game } = await RecordManager.instance.getCurrent() ?? {}
        const { gameName } = getGameInfo(game)

        const startTime = RecordManager.instance.getRecordStart()
        this.rpc.setActivity({
            ...generalInfo,
            smallImageText: "Recording...",
            details: "Recording...",
            state: gameName,
            smallImageKey: "recording",
            startTimestamp: startTime,
        })
    }

    static enable() {
        if (!this.rpc)
            this.rpc = new DiscordRPC.Client({ transport: "ipc" })

        this.rpc.login({ clientId })
        this.rpc.on("ready", () => this.loggedIn = true)

        Storage.set("discord_rpc", true)
    }

    static disable() {
        this.loggedIn = false
        this.enabled = false

        if (!this.rpc)
            return

        this.rpc.destroy()
        this.rpc = undefined

        Storage.set("discord_rpc", false)
    }
}