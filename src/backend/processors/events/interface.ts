export interface Progress {
    percent: number;
    status: string;
}

export type MessageEvents = {
    progress: (progress: Progress) => void
    end: (error?: string) => void
}

export type ProgressEvent = MessageEvents["progress"]