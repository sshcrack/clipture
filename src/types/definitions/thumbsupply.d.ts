declare module "thumbsupply" {
    export function lookupThumbnail(video: string, options?: GenerateOptions): Promise<string>;
    export function generateThumbnail(video: string, options?: GenerateOptions): Promise<string>;
    export interface GenerateOptions {
        size?: ThumbSize,
        timestamp?: string,
        forceCreate?: boolean,
        cacheDir?: string,
        mimetype?: string
    }

    export enum ThumbSize {
        MEDIUM,
        LARGE
    }
}
/*
thumbsupply.generateThumbnail('some-video.mp4', {
    size: thumbsupply.ThumbSize.MEDIUM, // or ThumbSize.LARGE
    timestamp: "10%", // or `30` for 30 seconds
    forceCreate: true,
    cacheDir: "~/myapp/cache",
    mimetype: "video/mp4"
})
*/