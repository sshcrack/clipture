export interface WindowInformation {
    className: string,
    executable: string,
    title: string,
    pid: number,
    hwnd: number,
    productName: string,
    monitorDimensions?: {
        width: number,
        height: number
    },
    intersectsMultiple: boolean
}

export enum CurrentSetting {
    NONE = 0,
    DESKTOP = 1,
    WINDOW = 2
}

export type WindowOptions = Omit<WindowInformation, "pid">

export interface CurrentSettingDescription {
    description: string
}