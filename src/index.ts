// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();
import { MainGlobals } from './Globals/mainGlobals';

import { ProcessManager } from '@backend/managers/process';
import { registerFuncs } from '@backend/registerFuncs';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import exitHook from 'exit-hook';
import { OBSManager } from './backend/managers/obs';
import { MainLogger } from './interfaces/mainLogger';
import { addCrashHandler, addUpdater } from './main_funcs';
import { ClipManager } from '@backend/managers/clip';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const logger = MainLogger.get("Main")
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

if (MainGlobals.getOS() !== "Windows_NT") {
  dialog.showErrorBox("Error", "This application is only supported on Windows")
  app.quit()
}

app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling,MediaSession')
logger.log("Is packaged", app.isPackaged, "Name", app.getName(), "Version", app.getVersion())

let mainWindow: BrowserWindow;
const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    height: 700,
    minHeight: 500,
    minWidth: 940,
    width: 1000,
    darkTheme: true,
    frame: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
    }
  });

  mainWindow.setMenuBarVisibility(false)
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.maximize()
  mainWindow.setIcon(MainGlobals.iconFile)
  ClipManager.registerProtocol()

  MainGlobals.window = mainWindow
  MainGlobals.obs = new OBSManager()
};


const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
}


app.on('second-instance', () => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

let alreadyShutdown = false

const handleExit = () => {
  if (alreadyShutdown)
    return

  logger.log("Shutting down...")
  alreadyShutdown = true
  ClipManager.shutdown()
  MainGlobals.obs.shutdown()
  ProcessManager.exit()
}

ipcMain.handle("quit-app", () => handleExit())
ipcMain.on("isDev", e => {
  e.returnValue = process.argv[2] === "dev"
})
app.on("will-quit", () => {
  handleExit()
})

logger.log("Is packaged", app.isPackaged, "Name", app.getName(), "Version", app.getVersion())
addCrashHandler()
addUpdater()


exitHook(() => handleExit())
registerFuncs.map(e => e())