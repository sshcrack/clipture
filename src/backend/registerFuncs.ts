import { RegManMain } from '@general/register/main';
import { registerLockEvents } from './events';
import { AuthManager } from './managers/auth';
import { Scene } from './managers/obs/Scene';
import { ProcessManager } from './managers/process';
import { registerProcessorEvents } from './processors/eventRegister';
import { TitlebarManager } from './titlebar';
import fs from "fs/promises"

export const registerFuncs = [
    () => RegManMain.register(),
    registerLockEvents,
    registerProcessorEvents,
    () => AuthManager.register(),
    () => TitlebarManager.register(),
    () => Scene.register(),
    () => ProcessManager.register()
]