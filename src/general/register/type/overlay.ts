import { OverlayAlignment } from '@backend/managers/game/overlay/interface';
import { addPrefixUnderscoreToObject } from 'src/types/additions';

export type OverlayEventPromises = addPrefixUnderscoreToObject<{
    set_alignment: (alignment: OverlayAlignment) => void
    set_enabled: (enabled: boolean) => void,

    get_alignment: () => OverlayAlignment,
    get_enabled: () => boolean,
    open_dev: () => void
}, "overlay">

export type OverlayMainToRender = addPrefixUnderscoreToObject<{
    start_update: (enabled: boolean) => void
}, "overlay">