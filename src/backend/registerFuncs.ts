import { RegManMain } from '@general/register/main';
import { registerLockEvents } from './events';
import { AuthManager } from './managers/auth';
import { ClipManager } from './managers/clip';
import { CloudManager } from './managers/cloud';
import { DiscoverManager } from './managers/cloud/discover';
import { DiscordManager } from './managers/discord';
import { GameManager } from './managers/game';
import { OverlayManager } from './managers/game/overlay';
import { BookmarkManager } from './managers/obs/bookmark';
import { Scene } from './managers/obs/Scene';
import { AudioSceneManager } from './managers/obs/Scene/audio';
import { Prerequisites } from './managers/prerequisites';
import { SettingsManager } from './managers/settings';
import { SystemManager } from './managers/system';
import { DebugGatherer } from './managers/system/debug_gatherer';
import { registerProcessorEvents } from './processors/eventRegister';
import { TitlebarManager } from './titlebar';

type RegisterFuncs = {
    [key: string]: () => unknown
}

const registerFuncs: RegisterFuncs = {
    RegManMain: () => RegManMain.register(),
    LockEvents: registerLockEvents,
    ProcessorEvents: registerProcessorEvents,
    Prerequisites: () => Prerequisites.register(),
    AuthManager: () => AuthManager.register(),
    TitlebarManager: () => TitlebarManager.register(),
    Scene: () => Scene.register(),
    GameManager: () => GameManager.register(),
    ClipManager: () => ClipManager.register(),
    SystemManager: () => SystemManager.register(),
    AudioSceneManager: () => AudioSceneManager.register(),
    SettingsManager: () => SettingsManager.register(),
    BookmarkManager: () => BookmarkManager.register(),
    DiscordManager: () => DiscordManager.register(),
    CloudManager: () => CloudManager.register(),
    DiscoverManager: () => DiscoverManager.register(),
    OverlayManager: () => OverlayManager.register(),
    DebugGatherer: () => DebugGatherer.register()
}

export default registerFuncs