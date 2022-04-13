// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();

import { app, BrowserWindow, dialog } from 'electron';
import { OBSManager } from './backend/managers/obs';
import { MainGlobals } from './Globals/mainGlobals';
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

if(MainGlobals.getOS() !== "Windows_NT") {
  dialog.showErrorBox("Error", "This application is only supported on Windows")
  app.quit()
}

const createWindow = (): void => {
  setTimeout(() => {
    MainGlobals.obs = new OBSManager()
  }, 1000)
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    darkTheme: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false
    }
  });

  mainWindow.setMenuBarVisibility(false)
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.maximize()

  MainGlobals.window = mainWindow
};

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