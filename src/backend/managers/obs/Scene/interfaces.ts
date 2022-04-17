export interface WindowInformation {
    className: string,
    executable: string,
    title: string,
    pid: number
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