import { UseToastOptions } from '@chakra-ui/react'
import { PerformanceStatistics } from 'src/types/obs/obs-studio-node'
import { AudioEventsPromises, AudioMainToRender } from './audio'
import { AuthEventsPromises, AuthMainToRender } from './auth'
import { ClipMainToRender, ClipsEventPromises } from './clips'
import { LockEventsSync, LockMainToRender } from './lock'
import { OBSEventsPromises, OBSEventsSync, OBSMainToRender } from './obs'
import { GameEventsPromises, GameMainToRender } from './game'
import { SettingsEventsPromises } from './settings'
import { SystemEventsPromises, SystemMainToRender } from './system'
import { VideoEventsPromises } from './video'
import { BookmarkEventsPromises, BookmarkMainToRender } from './bookmark'

export type RegisterEvents = LockEventsSync & OBSEventsSync

export type RegisterEventsPromises = AuthEventsPromises & AudioEventsPromises
    & VideoEventsPromises & SystemEventsPromises
    & GameEventsPromises & OBSEventsPromises
    & SettingsEventsPromises & ClipsEventPromises
    & BookmarkEventsPromises

export type MainToRender = {
    performance: (stats: PerformanceStatistics) => void,
    toast_show: (options: UseToastOptions) => void,
}
    & AuthMainToRender & ClipMainToRender
    & LockMainToRender & AudioMainToRender
    & GameMainToRender & OBSMainToRender
    & BookmarkMainToRender &
    SystemMainToRender
