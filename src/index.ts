// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();

import { registerFuncs } from '@backend/registerFuncs';
import { RegManMain } from '@general/register/main';
import { app, BrowserWindow, dialog } from 'electron';
import { OBSManager } from './backend/managers/obs';
import { MainGlobals } from './Globals/mainGlobals';
import { MainLogger } from './interfaces/mainLogger';
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


logger.log("Is packaged", app.isPackaged, "Name", app.getName(), "Version", app.getVersion())

let mainWindow: BrowserWindow;
const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    darkTheme: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
    }
  });

  mainWindow.setMenuBarVisibility(false)
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.maximize()

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

app.on("will-quit", () => MainGlobals.obs.shutdown())

registerFuncs.map(e => e())