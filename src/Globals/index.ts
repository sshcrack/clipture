export const MediaCategories: MediaCategoriesType[] = ["all_clips", "local", "uploaded", "videos"]
export type MediaCategoriesType = "all_clips"| "local" |"uploaded" |"videos"

export class Globals {
    static appId = "me.sshcrack.clipture"
    static cpuEncoders = ['x264', 'obs_x264']
}
