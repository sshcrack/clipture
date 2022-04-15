import { RegManMain } from '@general/register/main';
import { registerBackendEvents } from './events';
import { AuthManager } from './managers/auth';
import { registerProcessorEvents } from './processors/eventRegister';
import { TitlebarManager } from './titlebar';

export const registerFuncs = [
    () => RegManMain.register(),
    registerBackendEvents,
    registerProcessorEvents,
    () => AuthManager.register(),
    () => TitlebarManager.register()
]