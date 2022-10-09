import { RegManMain } from '@general/register/main';
import { MainLogger } from 'src/interfaces/mainLogger';
import { CloudClip } from './interface';

const log = MainLogger.get("Managers", "Cloud")
export class CloudManager {
    static register() {
        RegManMain.onPromise("cloud_upload", (_, clipName) => this.uploadClip(clipName));
        RegManMain.onPromise("cloud_delete", (_, clipName) => this.delete(clipName));
        RegManMain.onPromise("cloud_list", () => this.list());
    }

    static async uploadClip(clipName: string) {
        log.info("Uploading clip", clipName, "...")
        const rootPath = Storage.get("clip_path")
    }

    static async delete(clipName: string) {

    }

    static async list() {
        return null as CloudClip[]
    }
}