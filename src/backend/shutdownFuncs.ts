import { MainGlobals } from '@Globals/mainGlobals';
import { ClipManager } from './managers/clip';
import { GameManager } from './managers/game';
import { OverlayManager } from './managers/game/overlay';

export const shutdownFuncs = [
    () => ClipManager.shutdown(),
    () => MainGlobals.obs.shutdown(),
    () => GameManager.exit(),
    () => OverlayManager.shutdown()
]