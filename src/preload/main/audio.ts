import { AudioUpdateListener } from '@backend/managers/obs/Scene/interfaces'
import { RegManRender } from '@general/register/render'
import { getAddRemoveListener } from '@general/tools/listener'
import { FixedSources } from 'src/componentsOld/settings/categories/OBS/Audio/OBSInputDevices/interface'

type VolmeterListener = (source: string, magnitude: number[], peak: number[], inputPeak: number[]) => void
const volmeterListeners = [] as VolmeterListener[]
const deviceUpdateListeners = [] as AudioUpdateListener[]
const reg = RegManRender

reg.on("audio_volmeter_update", (_, ...args) => volmeterListeners.map(e => e(...args)))
reg.on("audio_device_update", (_, d) => deviceUpdateListeners.map(e => e(d)))
const audio = {
    onVolmeterChange: (callback: VolmeterListener) => getAddRemoveListener(callback, volmeterListeners),
    onDeviceUpdate: (callback: AudioUpdateListener) => getAddRemoveListener(callback, deviceUpdateListeners),
    activeSources: () => reg.emitPromise("audio_active_sources"),
    allDevices: () => reg.emitPromise("audio_devices"),
    deviceDefault: () => reg.emitPromise("audio_device_default"),
    setDevices: (devices: FixedSources) => reg.emitPromise("audio_device_set", devices),
}

export default audio