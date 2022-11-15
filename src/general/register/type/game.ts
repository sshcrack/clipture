import { GeneralGame } from '@backend/managers/game/interface';
import { DetectableGame, WindowInformation } from '@backend/managers/obs/Scene/interfaces';
import { addPrefixUnderscoreToObject } from 'src/types/additions';

export type GameEventsPromises = addPrefixUnderscoreToObject<{
    available_windows: (game: boolean) => WindowInformation[],
    detectable_games: () => DetectableGame[],
    curr_detectable: () => WindowInformation[],


    add_exclude: (info: GeneralGame) => void,
    remove_exclude: (info: GeneralGame) => void,
    list_exclude: () => GeneralGame[],
    set_exclude: (info: GeneralGame[]) => void,

    add_include: (info: GeneralGame) => void,
    remove_include: (info: GeneralGame) => void,
    list_include: () => GeneralGame[],
    set_include: (info: GeneralGame[]) => void,

    has_cache: () => boolean
}, "game">

export type GameMainToRender = addPrefixUnderscoreToObject<{
    update: (old: WindowInformation[], details: WindowInformation[]) => void,
}, "game">