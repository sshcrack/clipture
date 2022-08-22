import { RegManMain } from '@general/register/main';
import { CloudClip } from './interface';

export class CloudManager {
    static register() {
        RegManMain.onPromise("cloud_upload", (_, clipName) => this.uploadClip(clipName));
        RegManMain.onPromise("cloud_delete", (_, clipName) => this.delete(clipName));
        RegManMain.onPromise("cloud_list", () => this.list());
    }

    static async uploadClip(clipName: string) {

    }

    static async delete(clipName: string) {

    }

    static async list() {
        return null as CloudClip[]
    }
}