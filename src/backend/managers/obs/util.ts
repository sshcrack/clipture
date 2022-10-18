export function encodeString(str: string) {
    return str
        .split("#").join("#22")
        .split(":").join("#3A")
}

export function decodeString(str: string) {
    return str
        .split("#3A").join(":")
        .split("#22").join("#")
}