import { RegManRender } from '@general/register/render'
import { FixedSources } from 'src/components/settings/categories/OBS/Audio/OBSInputDevices/interface'

type VolmeterListener = (source: string, magnitude: number[], peak: number[], inputPeak: number[]) => void
const volmeterListeners = [] as VolmeterListener[]
const reg = RegManRender

reg.on("audio_volmeter_update", (_, ...args) => volmeterListeners.map(e => e(...args)))
const audio = {
    onVolmeterChange: (callback: VolmeterListener) => {
        volmeterListeners.push(callback)
        console.log("add length is", volmeterListeners.length)
        return () => {
            volmeterListeners.splice(volmeterListeners.indexOf(callback), 1)
            console.log("now is", volmeterListeners.length)
        }
    },
    activeSources: () => reg.emitPromise("audio_active_sources"),
    allDevices: () => reg.emitPromise("audio_devices"),
    deviceDefault: () => reg.emitPromise("audio_device_default"),
    setDevices: (devices: FixedSources) => reg.emitPromise("audio_device_set", devices),
}

export default audio