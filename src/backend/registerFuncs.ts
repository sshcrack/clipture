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

export const registerFuncs = [
    () => RegManMain.register(),
    registerLockEvents,
    registerProcessorEvents,
    () => Prerequisites.register(),
    () => AuthManager.register(),
    () => TitlebarManager.register(),
    () => Scene.register(),
    () => GameManager.register(),
    () => ClipManager.register(),
    () => SystemManager.register(),
    () => AudioSceneManager.register(),
    () => SettingsManager.register(),
    () => BookmarkManager.register(),
    () => DiscordManager.register(),
    () => CloudManager.register(),
    () => DiscoverManager.register(),
    () => OverlayManager.register(),
    () => DebugGatherer.register()
]