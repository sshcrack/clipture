import electronLog from "electron-log"
electronLog.transports.file.maxSize = 1024 * 1024 * 5

export class MainLogger {
    static formatScope(arr: string[]) {
        return arr.join(":")
    }

    static get(...name: string[]) {

        const logger = electronLog
            .scope(MainLogger.formatScope(name))

        return logger
    }
}