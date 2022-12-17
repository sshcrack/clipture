import { MainGlobals } from '@Globals/mainGlobals';
import { ClipManager } from './managers/clip';
import { GameManager } from './managers/game';
import { OverlayManager } from './managers/game/overlay';

export const shutdownFuncs = [
    async () => ClipManager.shutdown(),
    async () => MainGlobals.obs.shutdown(),
    async () => GameManager.exit(),
    async () => OverlayManager.shutdown()
]