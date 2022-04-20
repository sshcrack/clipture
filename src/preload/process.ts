import { RegManRender } from '@general/register/render'

const reg = RegManRender
const process = {
    availableWindows: (game: boolean) => reg.emitPromise("process_available_windows", game),
}

export default process;