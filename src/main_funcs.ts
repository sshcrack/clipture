import { AuthManager } from '@backend/managers/auth'
import { DebugGatherer } from '@backend/managers/system/debug_gatherer'
import { MainGlobals } from '@Globals/mainGlobals'
import { MessageBoxOptions, autoUpdater, dialog } from 'electron'
import unhandled from "electron-unhandled"
import FormData from 'form-data'
import { createReadStream } from 'fs'
import got from 'got/dist/source'
import { MainLogger } from './interfaces/mainLogger'
const log = MainLogger.get("Main", "Updater")
import updater from "update-electron-app"


export function addUpdater() {


    console.log("Updater start")
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    updater({
        repo: 'sshcrack/clipture',
        updateInterval: '10 minutes',
        logger: log
    })
    console.log("Updater end")

    autoUpdater.on('update-downloaded', (_, releaseNotes, releaseName) => {
        const dialogOpts: MessageBoxOptions = {
            type: 'info',
            buttons: ['Restart', 'Later'],
            title: 'Application Update',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail: 'A new version has been downloaded. Restart the application to apply the updates.'
        }

        dialog.showMessageBox(dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) autoUpdater.quitAndInstall()
        })
    })

    autoUpdater.on('error', message => {
        log.error("Could not check auto-updater:", message)
    })
}

export function addCrashHandler() {
    unhandled({
        showDialog: true,
        logger: (...e) => log.error(...e),
        reportButton: async error => {
            const logFile = await DebugGatherer.getDebugFile()
            const body = new FormData()
            const cookieHeader = await AuthManager.getCookies()
            if(!cookieHeader)
                return log.debug("Can not report error because not signed in.")

            body.append("archive", createReadStream(logFile))
            body.append("error", error.stack)

            log.debug("Uploading report...")
            log.error(error?.stack)
            got.post(`${MainGlobals.baseUrl}/api/debug/report`, {
                headers: { cookie: cookieHeader },
                body,
                throwHttpErrors: false,
            })
            .then(() => log.info("Report uploaded."))
            .catch(e => log.error("Could not upload report", e))
        }
    })
}