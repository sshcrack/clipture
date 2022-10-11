import { getHex, normalizePath } from '@general/tools/fs'

export const fileHex = new Map<string, string>()

export function addToCached(absoluteFile: string, hex: string) {
    fileHex.set(normalizePath(absoluteFile), hex)
}

export async function getHexCached(absoluteFile: string) {
    const normalized = normalizePath(absoluteFile)
    const hex = fileHex.get(normalized) ?? await getHex(absoluteFile)

    fileHex.set(normalized, hex)
    return hex
}
