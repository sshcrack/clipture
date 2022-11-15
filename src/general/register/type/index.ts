import { UseToastOptions } from '@chakra-ui/react'
import { PerformanceStatistics } from 'src/types/obs/obs-studio-node'
import { AudioEventsPromises, AudioMainToRender } from './audio'
import { AuthEventsPromises, AuthMainToRender } from './auth'
import { BookmarkEventsPromises, BookmarkMainToRender } from './bookmark'
import { ClipMainToRender, ClipsEventPromises } from './clips'
import { CloudEventsPromises, CloudMainToRender } from './cloud'
import { DiscordEventsPromises } from './discord'
import { GameEventsPromises, GameMainToRender } from './game'
import { LockEventsSync, LockMainToRender } from './lock'
import { OBSEventsPromises, OBSEventsSync, OBSMainToRender } from './obs'
import { OverlayEventPromises, OverlayMainToRender } from './overlay'
import { PrerequisitesEventsPromises, PrerequisitesMainToRender } from './prerequisites'
import { SettingsEventsPromises } from './settings'
import { StorageEventsPromises, StorageMainToRender } from './storage'
import { SystemEventsPromises, SystemEventsSync, SystemMainToRender } from './system'
import { VideoEventsPromises } from './video'

export type RegisterEvents = LockEventsSync & OBSEventsSync & SystemEventsSync

export type RegisterEventsPromises = AuthEventsPromises & AudioEventsPromises
    & VideoEventsPromises & SystemEventsPromises
    & GameEventsPromises & OBSEventsPromises
    & SettingsEventsPromises & ClipsEventPromises
    & BookmarkEventsPromises & PrerequisitesEventsPromises
    & CloudEventsPromises & DiscordEventsPromises
    & StorageEventsPromises & OverlayEventPromises

export type MainToRender = {
    performance: (stats: PerformanceStatistics) => void,
    toast_show: (options: UseToastOptions) => void,
}
    & AuthMainToRender & ClipMainToRender
    & LockMainToRender & AudioMainToRender
    & GameMainToRender & OBSMainToRender
    & BookmarkMainToRender
    & SystemMainToRender & PrerequisitesMainToRender
    & CloudMainToRender & StorageMainToRender
    & OverlayMainToRender
