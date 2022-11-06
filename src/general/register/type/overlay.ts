import { OverlayAlignment } from '@backend/managers/game/overlay/interface';
import { addPrefixUnderscoreToObject } from 'src/types/additions';

export type OverlayEventPromises = addPrefixUnderscoreToObject<{
    set_alignment: (alignment: OverlayAlignment) => void
    set_enabled: (enabled: boolean) => void,

    get_alignment: () => OverlayAlignment,
    get_enabled: () => boolean
}, "overlay">

export type OverlayMainToRender = addPrefixUnderscoreToObject<{
}, "overlay">