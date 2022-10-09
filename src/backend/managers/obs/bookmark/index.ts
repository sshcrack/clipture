import { RegManMain } from "@general/register/main";
import { Storage } from "@Globals/storage";
import { globalShortcut, Input } from "electron";
import { MainLogger } from "src/interfaces/mainLogger";

const log = MainLogger.get("Backend", "Managers", "OBS", "Bookmark")
export class BookmarkManager {
    private static currHotkey = undefined as string
    private static listeners = [] as (() => unknown)[]

    static register() {
        RegManMain.onPromise("bookmark_hotkey_get", async () => Storage.get("bookmark_hotkey", "F9"))
        RegManMain.onPromise("bookmark_hotkey_set", async (_, hotkey) => this.changeHotkey(hotkey))

        RegManMain.onPromise("bookmark_listen_key", ({ sender }) => {
            return new Promise<string>((resolve, reject) => {
                const func = (e: Event, { key, alt, control, shift, meta }: Input) => {
                    let hotkey = []

                    if (alt)
                        hotkey.push("Alt")
                    if (control)
                        hotkey.push("CommandOrControl")
                    if (shift)
                        hotkey.push("Shift")
                    if (meta)
                        hotkey.push("meta")

                    if(!hotkey.some(e => e.toLowerCase() === key.toLowerCase()) &&
                        !(control && key.toLowerCase() === "control")
                        )
                        hotkey.push(key)
                    e.preventDefault()

                    resolve(hotkey.join("+"))
                }

                sender.once("before-input-event", func)
                setTimeout(() => {
                    sender.removeListener("before-input-event", func)
                    reject(new Error("Timeout of 15s reached."))
                }, 15000)
            })

        })
    }

    static changeHotkey(hotkey: string) {
        log.info("Changing hotkey to", hotkey)
        Storage.set("bookmark_hotkey", hotkey)
        this.registerHotkey(hotkey)
    }

    static initialize() {
        const hotkey = Storage.get("bookmark_hotkey", "F9")
        this.registerHotkey(hotkey ?? "F9")
    }

    private static unregisterHotkey(hotkey: string) {
        if (!hotkey)
            return log.info("cannot unregister, Hotkey is undefined")

        const registered = globalShortcut.isRegistered(hotkey)
        if (!registered)
            return log.info("Could not unregister hotkey", hotkey, ", already unregistered")

        log.info("Unregister hotkey", hotkey)
        globalShortcut.unregister(hotkey)
    }

    private static registerHotkey(hotkey: string) {
        if (!hotkey)
            return log.info("cannot unregister, Hotkey is undefined")

        const curr = this.currHotkey
        const registered = curr && globalShortcut.isRegistered(curr)
        if (curr) {
            if (registered)
                return log.info("Trying to register hotkey", hotkey, "but it is already registered.")
            log.info("Trying to register hotkey", hotkey, "but", curr, "is already registered.")
            this.unregisterHotkey(hotkey)
        }

        log.info("Registering hotkey", hotkey)
        globalShortcut.register(hotkey, () => this.onHotkey())
    }

    static addHotkeyHook(cb: () => unknown) {
        this.listeners.push(cb)

        return () => {
            const index = this.listeners.indexOf(cb)
            if(index === -1)
                return
            this.listeners.splice(index, 1)
        }
    }

    private static onHotkey() {
        this.listeners.map(e => e())
    }
}