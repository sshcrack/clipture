import fs from "fs/promises"

export function existsProm(file: string) {
    return fs.stat(file)
        .then(() => true)
        .catch(() => false)
}