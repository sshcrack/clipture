import { DeviceType } from '@backend/managers/obs/Scene/interfaces'
import { FixedLengthArray } from 'type-fest'

export type SourceInfo = {
    device_id: string,
    type: DeviceType
}

export type FixedSources = FixedLengthArray<SourceInfo, 2>