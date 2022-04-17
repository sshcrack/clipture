import { RegManMain } from '@general/register/main';
import { registerLockEvents } from './events';
import { AuthManager } from './managers/auth';
import { Scene } from './managers/obs/Scene';
import { registerProcessorEvents } from './processors/eventRegister';
import { TitlebarManager } from './titlebar';

export const registerFuncs = [
    () => RegManMain.register(),
    registerLockEvents,
    registerProcessorEvents,
    () => AuthManager.register(),
    () => TitlebarManager.register(),
    () => Scene.register()
]