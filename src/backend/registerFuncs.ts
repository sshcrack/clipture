import { RegManMain } from '@general/register/main';
import { registerLockEvents } from './events';
import { AuthManager } from './managers/auth';
import { ClipManager } from './managers/clip';
import { Scene } from './managers/obs/Scene';
import { AudioSceneManager } from './managers/obs/Scene/audio';
import { GameManager } from './managers/game';
import { SettingsManager } from './managers/settings';
import { SystemManager } from './managers/system';
import { registerProcessorEvents } from './processors/eventRegister';
import { TitlebarManager } from './titlebar';

export const registerFuncs = [
    () => RegManMain.register(),
    registerLockEvents,
    registerProcessorEvents,
    () => AuthManager.register(),
    () => TitlebarManager.register(),
    () => Scene.register(),
    () => GameManager.register(),
    () => ClipManager.register(),
    () => SystemManager.register(),
    () => AudioSceneManager.register(),
    () => SettingsManager.register()
]