export interface CloudClip {
    id:         string;
    uploadDate: string;
    title:      string;
    dcGameId:   null;
    windowInfo: WindowInfo | null;
}

export interface WindowInfo {
    id:     string;
    userId: string;
    title:  string;
    icon:   string;
}
