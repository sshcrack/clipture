import { Progress } from '@backend/processors/events/interface';
import { CloudGeneralGame } from '../game/interface';

export interface CloudClip {
    id: string;
    uploadDate: string;
    title: string;
    dcGameId: null;
    isPublic: boolean;
    windowInfo: CloudWindowInfo | null;
    hex: string
}

export interface CloudWindowInfo {
    id: string;
    userId: string;
    title: string;
    icon: string;
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



export type FilteredClip = {
    id: string;
    uploadDate: Date;
    title: string;
    game: CloudGeneralGame,
    uploaderId: string;
    hex: string;
    likes: number;
    dcGameId: string | null;
    windowInfo: CloudWindowInfo | null;
}

export type DiscoverClip = Omit<FilteredClip, "hex">
export type DiscoverResponse = {
    clips: DiscoverClip[],
    leftOver: boolean
}