import { MainGlobals } from '@Globals/mainGlobals';
import { ClipManager } from './managers/clip';
import { GameManager } from './managers/game';

export const shutdownFuncs = [
    () => ClipManager.shutdown(),
    () => MainGlobals.obs.shutdown(),
    () => GameManager.exit()
]