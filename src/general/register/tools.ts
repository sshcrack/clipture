const regEveSync = [] as string[]
const regEveProm = [] as string[]

export function getSuccessfulEvent(baseName: string) {
    return baseName + "_successful"
}

export function getErrorEvent(baseName: string) {
    return baseName + "_error"
}

export function registerEventSync(eventName: string) {
    if (regEveSync.includes(eventName))
        return

    regEveSync.push(eventName)
}

export function hasEventSync(eventName: string) {
    return regEveSync.includes(eventName)
}



export function registerEventProm(eventName: string) {
    if (regEveProm.includes(eventName))
        return

    regEveProm.push(eventName)
}

export function hasEventProm(eventName: string) {
    return regEveProm.includes(eventName)
}
