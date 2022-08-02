import { RegManRender } from '@general/register/render'

type VolmeterListener = (source: string, magnitude: number[], peak: number[], inputPeak: number[]) => void
const volmeterListeners = [] as VolmeterListener[]
const reg = RegManRender

reg.on("audio_volmeter_update", (_, ...args) => volmeterListeners.map(e => e(...args)))
const audio = {
    onVolmeterChange: (callback: VolmeterListener) => {
        volmeterListeners.push(callback)
        return () => {
            volmeterListeners.splice(volmeterListeners.indexOf(callback), 1)
        }
    },
    activeSources: () => reg.emitPromise("audio_active_sources"),
    allDevices: () => reg.emitPromise("audio_devices"),
    deviceDefault: () => reg.emitPromise("audio_device_default")
}

export default audio