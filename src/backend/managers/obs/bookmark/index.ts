import { RegManMain } from "@general/register/main";
import { getAddRemoveListener } from '@general/tools/listener';
import { Storage } from "@Globals/storage";
import { getWebpackDir } from '@backend/tools/fs';
import { Input } from 'electron';
import { GlobalKeyboardListener} from "node-global-key-listener"
import { MainLogger } from "src/interfaces/mainLogger";
import { getLocalizedT } from 'src/locales/backend_i18n';
import path from 'path';

const keyboardPath = getWebpackDir() + "/key-listener/"

const globalShortcut = new GlobalKeyboardListener({
    mac:  { serverPath: path.join(keyboardPath, "MacKeyServer")},
    windows:  { serverPath: path.join(keyboardPath, "WinKeyServer.exe")}
});

const log = MainLogger.get("Backend", "Managers", "OBS", "Bookmark")
type IGlobalKey = Parameters<Parameters<GlobalKeyboardListener["addListener"]>[0]>[0]["name"]
export class BookmarkManager {
    private static currHotkey = undefined as string
    private static listeners = [] as (() => unknown)[]
    private static pressedKeys = [] as IGlobalKey[]

    static register() {
        RegManMain.onPromise("bookmark_hotkey_get", async () => Storage.get("bookmark_hotkey", "F9"))
        RegManMain.onPromise("bookmark_hotkey_set", async (_, hotkey) => this.changeHotkey(hotkey))

        RegManMain.onPromise("bookmark_listen_key", ({ sender }) => {
            return new Promise<string>((resolve, reject) => {
                const func = (e: Event, { key, alt, control, shift, meta }: Input) => {
                    const hotkey = []

                    if (alt)
                        hotkey.push("Alt")
                    if (control)
                        hotkey.push("CommandOrControl")
                    if (shift)
                        hotkey.push("Shift")
                    if (meta)
                        hotkey.push("meta")

                    if (!hotkey.some(e => e.toLowerCase() === key.toLowerCase()) &&
                        !(control && key.toLowerCase() === "control")
                    )
                        hotkey.push(key)
                    e.preventDefault()

                    resolve(hotkey.join("+"))
                }

                sender.once("before-input-event", func)
                setTimeout(() => {
                    const t = getLocalizedT("backend", "obs.bookmark")

                    sender.removeListener("before-input-event", func)
                    reject(new Error(t("timeout")))
                }, 15000)
            })

        })
    }

    static changeHotkey(hotkey: string) {
        log.info("Changing hotkey to", hotkey)
        Storage.set("bookmark_hotkey", hotkey)
        this.currHotkey = hotkey ?? "F9"
    }

    static async initialize() {
        const hotkey = Storage.get("bookmark_hotkey", "F9")
        this.currHotkey = hotkey ?? "F9"
        let lastTimeout: NodeJS.Timeout = null

        await globalShortcut.addListener(e => {
            if(e.state === "DOWN")
                this.pressedKeys.push(e.name)

            if(this.pressedKeys.length > 15)
                this.pressedKeys = []
            if(e.state === "UP") {
                this.pressedKeys = this.pressedKeys.filter(x => x !== e.name)
                if(lastTimeout)
                    clearTimeout(lastTimeout)
                lastTimeout = setTimeout(() => {
                    this.pressedKeys = []
                    const bookmarkHotkey = this.currHotkey.split("+")
                    const isHotkey = this.pressedKeys.every(e => bookmarkHotkey.includes(e))
                    if(this.pressedKeys.length <= 0)
                        return

                    console.log("Bookmark", bookmarkHotkey, "Curr", this.pressedKeys, "is", isHotkey)
                    if(!isHotkey)
                        return

                    this.onHotkey()
                }, 500)
            }

        })
    }
    static addHotkeyHook(cb: () => unknown) {
        return getAddRemoveListener(cb, this.listeners)
    }

    private static onHotkey() {
        this.listeners.map(e => e())
    }
}