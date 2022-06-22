import { Globals } from '@Globals/index';
import { MainGlobals } from '@Globals/mainGlobals';
import { NotificationCallback, WindowsToaster } from 'node-notifier';
import { Notification } from 'node-notifier/notifiers/notificationcenter';

const notifier = new WindowsToaster({
    customPath: __dirname + "/vendor/snoreToast/snoretoast-x64.exe",
})

export function notify(notification?: Notification, callback?: NotificationCallback) {
    return notifier.notify({
        icon: MainGlobals.iconFile,
        appID: Globals.appId,
        ...notification
    }, callback)
}