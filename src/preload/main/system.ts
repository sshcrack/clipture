import { RegManRender } from '@general/register/render';

const system = {
    open_folder: (path: string) => RegManRender.emitPromise("system_open_folder", path),
    get_dashboard_page_default: () => RegManRender.emitPromise("system_get_dashboard_page_default"),
    set_default_dashboard_page: (newIndex: number) => RegManRender.emitPromise("system_set_default_dashboard_page", newIndex)
}
export default system;