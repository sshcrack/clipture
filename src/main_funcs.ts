import { autoUpdater, dialog } from 'electron'
import unhandled from "electron-unhandled"
import { debugInfo, openNewGitHubIssue } from 'electron-util'
import { MainLogger } from './interfaces/mainLogger'

const logger = MainLogger.get("Main", "Updater")

export function addUpdater() {

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('update-electron-app')({
        repo: 'sshcrack/clipture',
        updateInterval: '10 minutes',
        logger: logger
    })

    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
        const dialogOpts = {
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
        logger.error("Could not check auto-updater:", message)
    })
}

export function addCrashHandler() {
    unhandled({
        showDialog: true,
        logger: (...e) => logger.error(...e),
        reportButton: error => {
            openNewGitHubIssue({
                user: "sshcrack",
                repo: "clipture",
                body: `#Automated Bug Report \n ### This is a bug reported automatically by the crash handler\`\`\`\n${error.stack}\n\`\`\`\n\n---\n\n${debugInfo()}`
            })
        }
    })
}