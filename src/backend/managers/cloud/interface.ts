import { Progress } from '@backend/processors/events/interface';

export interface CloudClip {
    id:         string;
    uploadDate: string;
    title:      string;
    dcGameId:   null;
    windowInfo: CloudWindowInfo | null;
    hex: string
}

export interface CloudWindowInfo {
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