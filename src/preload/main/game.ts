import { GeneralGame } from '@backend/managers/game/interface';
import { WindowInformation } from '@backend/managers/obs/Scene/interfaces';
import { RegManRender } from '@general/register/render'
import { getAddRemoveListener } from '@general/tools/listener';


type Listener = (prevProcesses: WindowInformation[], diff: WindowInformation[]) => unknown
const listeners = [] as Listener[]


const reg = RegManRender

reg.on("game_update", (_, p, d) => listeners.map(e => e(p, d)))
const game = {
    availableWindows: (game: boolean) => reg.emitPromise("game_available_windows", game),


    listExclude: () => reg.emitPromise("game_list_exclude"),
    addExclude: (info: GeneralGame) => reg.emitPromise("game_add_exclude", info),
    removeExclude: (info: GeneralGame) => reg.emitPromise("game_remove_exclude", info),
    setExclude: (info: GeneralGame[]) => reg.emitPromise("game_set_exclude", info),

    listInclude: () => reg.emitPromise("game_list_include"),
    addInclude: (info: GeneralGame) => reg.emitPromise("game_add_include", info),
    removeInclude: (info: GeneralGame) => reg.emitPromise("game_remove_include", info),
    setInclude: (info: GeneralGame[]) => reg.emitPromise("game_set_include", info),


    detectable: () => reg.emitPromise("game_detectable_games"),
    currDetectable: () => reg.emitPromise("game_curr_detectable"),
    addUpdateListener: (cb: Listener) => getAddRemoveListener(cb, listeners),

    hasCache: () => reg.emitPromise("game_has_cache")
}

export default game;