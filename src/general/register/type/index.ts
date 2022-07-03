import { UseToastOptions } from '@chakra-ui/react'
import { PerformanceStatistics } from 'src/types/obs/obs-studio-node'
import { AudioEventsPromises, AudioMainToRender } from './audio'
import { AuthEventsPromises, AuthMainToRender } from './auth'
import { ClipMainToRender } from './clips'
import { LockEventsSync, LockMainToRender } from './lock'
import { OBSEventsPromises, OBSEventsSync } from './obs'
import { ProcessEventsPromises, ProcessMainToRender } from './process'
import { SettingsEventsPromises } from './settings'
import { SystemEventsPromises } from './system'
import { VideoEventsPromises } from './video'

export type RegisterEvents = LockEventsSync & OBSEventsSync

export type RegisterEventsPromises = AuthEventsPromises & AudioEventsPromises
    & VideoEventsPromises & SystemEventsPromises
    & ProcessEventsPromises & OBSEventsPromises
    & SettingsEventsPromises

export type MainToRender = {
    performance: (stats: PerformanceStatistics) => void,
    toast_show: (options: UseToastOptions) => void,
}
    & AuthMainToRender & ClipMainToRender
    & LockMainToRender & AudioMainToRender
    & ProcessMainToRender
