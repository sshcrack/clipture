import { RegManMain } from '@general/register/main';
import { Storage } from '@Globals/storage';
import { MainLogger } from 'src/interfaces/mainLogger';
import { ClipManager } from '../clip';
import { Video } from '../clip/interface';
import { RecordManager } from '../obs/core/record';
import { sleepSync } from '../obs/core/tools';
import { DeleteMethods } from './interface';

const log = MainLogger.get("Managers", "Storage")
const DAY_MS = 1000 * 60 * 60 * 24
const WEEK_MS = DAY_MS * 7
export class StorageManager {
    private static deleteMethod = [] as DeleteMethods[];
    private static lockedVideos = [] as string[]

    static register() {
        RegManMain.onPromise("storage_get_delete_mode", async () => this.deleteMethod)
        RegManMain.onPromise("storage_set_delete_mode", async (_, method) => {
            Storage.set("delete_method", method)
            this.deleteMethod = method
            this.check()
        })

        this.deleteMethod = Storage.get("delete_method", [])
        RecordManager.instance.addRecordListener(a => this.onRecordChange(a))
    }

    static async check() {
        log.debug("Checking for videos to delete...")
        const videos = await ClipManager.listVideos()

        if (!videos)
            return log.warn("Listed videos are null wtf")

        const now = Date.now()
        const untilDeleteWeek = now - WEEK_MS
        const untilDeleteDay = now - DAY_MS
        const checks = {
            [DeleteMethods.NO_BOOKMARKS]: (arr: Video[]) => arr.filter(e => (e?.bookmarks ?? [])?.length === 0),
            [DeleteMethods.WEEK_OLD]: (arr: Video[]) => arr.filter(e => e.modified < untilDeleteWeek),
            [DeleteMethods.DAY_OLD]: (arr: Video[]) => arr.filter(e => e.modified < untilDeleteDay)
        } as { [key in DeleteMethods]: (_: Video[]) => Video[] }

        let toDelete = videos.concat([])
        this.deleteMethod.forEach(method => {
            const check = checks[method]
            toDelete = check(toDelete)
        })

        if (this.deleteMethod.length === 0)
            toDelete = []

        this.lockedVideos = toDelete.map(e => e.videoName)
        console.log("LockedVids are", this.lockedVideos)
        RegManMain.send("storage_lock", this.lockedVideos)

        log.silly("Waiting for frontend to update...")
        await sleepSync(250)

        log.silly("Deleting", toDelete.length, "Videos...")
        const res = await Promise.all(toDelete.map(e => ClipManager.delete(e.videoName).then(() => true).catch(() => false)))
        const notDeleted = res.filter(e => !e)
        if (notDeleted.length !== 0)
            log.silly("Could not delete", notDeleted, "videos")

        this.lockedVideos = []
        const deleted = res.length - notDeleted.length
        RegManMain.send("storage_lock", this.lockedVideos)

        if (deleted !== 0)
            RegManMain.send("toast_show", { status: "success", title: `Deleted ${deleted} old ${deleted > 1 ? "videos" : "video"}.` })
    }

    static async onRecordChange(recording: boolean) {
        if (recording)
            return

        await this.check()
    }
}