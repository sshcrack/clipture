import { Globals } from '@Globals'

export function getSuccessfulEvent(baseName: string) {
    return baseName + "_successful"
}

export function getErrorEvent(baseName: string) {
    return baseName + "_error"
}