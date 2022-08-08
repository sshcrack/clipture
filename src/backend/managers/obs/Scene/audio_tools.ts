import { AllAudioDevices, AudioDevice } from './interfaces'

export type FindAudioDevicesReturn = undefined | { type: "desktop" | "microphone" } & AudioDevice

export function findAudioDevice(id: string, audioDevices: AllAudioDevices): FindAudioDevicesReturn {
    const { desktop, microphones } = audioDevices ?? {}
    const deskFound = desktop.find(e => e.device_id === id)

    if (deskFound)
        return { type: "desktop", ...deskFound }

    const micFound = microphones.find(e => e.device_id === id)
    if (micFound)
        return { type: "microphone", ...micFound }

    return undefined
}