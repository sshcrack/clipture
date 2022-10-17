import { Progress } from '@backend/processors/events/interface';

export interface CloudClip {
    id:         string;
    uploadDate: string;
    title:      string;
    dcGameId:   null;
    windowInfo: WindowInfo | null;
    hex: string
}

export interface WindowInfo {
    id:     string;
    userId: string;
    title:  string;
    icon:   string;
}

export type CloudClipStatus = {
    clipName: string,
    progress: Progress
}

export type CloudUsage = {
    maxClipSize: number,
    maxTotal: number,
    current: number
}