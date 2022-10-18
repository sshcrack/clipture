import { Storage } from '@Globals/storage'
import path from "path"
import fs from "fs"
import { protocol, ProtocolRequest, ProtocolResponse } from 'electron'
import { MainLogger } from 'src/interfaces/mainLogger'

const log = MainLogger.get("Managers", "Clip", "Protocol")
export class ClipProtocol {
    private static registered = false
    static register() {
        if (this.registered)
            return

        log.info("Registering Clip Protocol...")
        protocol.registerFileProtocol("clip-video-file", this.clipProtocolHandler)
    }



    static clipProtocolHandler(req: ProtocolRequest, callback: (response: (string) | (ProtocolResponse)) => void) {
        let requestedPath = decodeURIComponent(req.url.replace("clip-video-file:///", ""))
        const clipRootUrl = Storage.get("clip_path")
        const clipPath = path.join(clipRootUrl, requestedPath)

        const ext = path.extname(clipPath)

        if (ext !== ".ico" && ext !== ".mkv" && ext !== ".mp4") {
            callback({
                // -10 is ACCESS_DENIED
                // https://source.chromium.org/chromium/chromium/src/+/master:net/base/net_error_list.h
                error: -10
            });
            return;
        }

        let check = fs.existsSync(clipPath)
        if (!check || requestedPath.includes("..") || requestedPath.includes("/")) {
            callback({
                // -6 is FILE_NOT_FOUND
                // https://source.chromium.org/chromium/chromium/src/+/master:net/base/net_error_list.h
                error: -6
            });
            return;
        }

        callback({
            path: path.resolve(clipPath)
        });
    }
}