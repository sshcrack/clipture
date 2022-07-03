import { addPrefixUnderscoreToObject } from 'src/types/additions';

export type SystemEventsPromises = addPrefixUnderscoreToObject<{
    open_clip: (path: string) => void,
    get_dashboard_page_default: () => number,
    set_default_dashboard_page: (newIndex: number) => void,
    set_close_behavior: (behavior: "minimize" | "close") => void,
    close_curr_window: () => void,
}, "system">