import { app, safeStorage } from 'electron';
import { default as Store } from 'electron-store';
import path from 'path';
import { MainLogger } from 'src/interfaces/mainLogger';


const log = MainLogger.get("Globals", "Storage")

class StorageExtended<T> extends Store<T> {
    public setSecure(key: SecureKeys, value: string) {
        try {
            const encrypted = safeStorage.encryptString(value)
            const hex = encrypted.toString("hex")


            this.set(getEncryptKey(key), hex)
        } catch (e) {
            log.warn("Could not encrypt", e)
            return this.set(key, value)
        }
    }

    public async getSecure<T = string>(key: SecureKeys, defaultValue?: T): Promise<string | T> {
        try {
            const encrypted = this.get(getEncryptKey(key) as any) as unknown as string
            if (!encrypted)
                throw "Encrypted Value could not be found."

            if (typeof encrypted !== "string") {
                log.error("Encrypted value is not a string:", encrypted)
                return defaultValue
            }

            const buffer = Buffer.from(encrypted, "hex")
            const decrypted = safeStorage.decryptString(buffer)

            return decrypted ?? defaultValue
        } catch (e) {
            log.warn("Could not decrypt", e)
            return this.get(key as any, defaultValue as unknown) as string
        }
    }
}

function getEncryptKey(key: string) {
    return key + "_encrypted"
}

export type SecureKeys = "next-auth.csrf-token" | "next-auth.session-token"


const defaultInstall = app.getPath("userData")
const defaultClips = path.join(defaultInstall, "clips")

export const Storage = new StorageExtended({
    defaults: {
        "install_dir": defaultInstall,
        "install_dir_selected": false,
        "clip_path": defaultClips
    }
})