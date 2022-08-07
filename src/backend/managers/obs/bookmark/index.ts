import { RegManMain } from "@general/register/main";
import { Storage } from "@Globals/storage";
import { BrowserWindow, globalShortcut, Input } from "electron";
import { ignoreElements } from "rxjs";
import { MainLogger } from "src/interfaces/mainLogger";

const log = MainLogger.get("Backend", "Managers", "OBS", "Bookmark")
export class BookmarkManager {
    private static currHotkey = undefined as string

    static register() {
        RegManMain.onPromise("bookmark_hotkey_get", async () => Storage.get("bookmark_hotkey"))
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
        Storage.set("bookmark_hotkey", hotkey)
        this.registerHotkey(hotkey)
    }

    static initialize() {
        const hotkey = Storage.get("bookmark_hotkey", "F9")
        this.registerHotkey(hotkey)
    }

    private static unregisterHotkey(hotkey: string) {
        const registered = globalShortcut.isRegistered(hotkey)
        if (!registered)
            return log.info("Could not unregister hotkey", hotkey, ", already unregistered")

        log.info("Unregister hotkey", hotkey)
        globalShortcut.unregister(hotkey)
    }

    private static registerHotkey(hotkey: string) {
        const curr = this.currHotkey
        const registered = globalShortcut.isRegistered(curr)
        if (curr) {
            if (registered)
                return log.info("Trying to register hotkey", hotkey, "but it is already registed.")
            log.info("Trying to register hotkey", hotkey, "but", curr, "is already registered.")
            this.unregisterHotkey(hotkey)
        }

        globalShortcut.register(hotkey, () => this.onHotkey())
    }

    private static onHotkey() {
        log.log("Hotkey fired!")
    }
}