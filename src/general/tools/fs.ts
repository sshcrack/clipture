import crypto from "crypto"
import fs from "fs"

export function getHex(file: string) {
    return new Promise<string>((resolve, reject) => {
        const hash = crypto.createHash("sha256").setEncoding('hex');
        fs.createReadStream(file)
            .once('error', reject)
            .pipe(hash)
            .once('finish', function () {
                resolve(hash.read());
            });
    });
}