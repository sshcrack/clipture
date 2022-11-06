export enum OverlayAlignment {
    TOP_LEFT,
    TOP_CENTER,
    TOP_RIGHT,
    CENTER_LEFT,
    CENTER_RIGHT,
    BOTTOM_LEFT,
    BOTTOM_CENTER,
    BOTTOM_RIGHT
}

export type ParentInfo = {
    /** Width of the parent window */
    parentWidth: number;
    /** Height of the parent window */
    parentHeight: number;
    /** X of the parent window */
    parentX: number;
    /** Y of the parent window */
    parentY: number
}

export type MonitorInfo = {
    monitorWidth: number
    monitorHeight: number
}