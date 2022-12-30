import { app, BrowserWindow, dialog, ipcMain, Menu, Tray } from 'electron';
import { MainGlobals } from './Globals/mainGlobals';
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}


// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();

import { ClipProtocol } from '@backend/managers/clip/protocol';
import { SystemManager } from '@backend/managers/system';
import { registerFuncs } from '@backend/registerFuncs';
import { shutdownFuncs } from '@backend/shutdownFuncs';
import windowStateKeeper from "electron-window-state";
import exitHook from 'exit-hook';
import { OBSManager } from './backend/managers/obs';
import { MainLogger } from './interfaces/mainLogger';
import { addCrashHandler, addUpdater } from './main_funcs';

const logger = MainLogger.get("Main")
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (MainGlobals.getOS() !== "Windows_NT") {
  dialog.showErrorBox("Error", "This application is only supported on Windows")
  app.quit()
}


const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
}
/*
declare const OVERLAY_WINDOW_WEBPACK_ENTRY: string;
declare const OVERLAY_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
*/

app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling,MediaSession')
logger.log("Is packaged", app.isPackaged, "Name", app.getName(), "Version", app.getVersion())

SystemManager.initialize()
addCrashHandler()
addUpdater()

try {
  exitHook(() => handleExit())
} catch (e) { logger.warn("Could not register exit hook", e) }

let mainWindow: BrowserWindow;
let trayIcon = null as Tray
let alreadyShutdown = false

const createWindow = (): void => {
  const { width, height, x, y, manage: manageWindow } = windowStateKeeper({
    defaultHeight: 700,
    defaultWidth: 1000
  })

  mainWindow = new BrowserWindow({
    height,
    width,
    x,
    y,
    minHeight: 500,
    minWidth: 940,
    darkTheme: true,
    frame: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
    }
  });

  mainWindow.setMenuBarVisibility(false)
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.setIcon(MainGlobals.iconFile)
  ClipProtocol.register()

  trayIcon = new Tray(MainGlobals.iconFile);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show app',
      click: () => SystemManager.toTray(MainGlobals.window, false)
    },
    {
      label: 'Quit',
      click: () => app.quit()
    }
  ]);


  trayIcon.setToolTip('Clipture')
  trayIcon.setContextMenu(contextMenu);
  trayIcon.on("click", () => SystemManager.toTray(MainGlobals.window, false))

  MainGlobals.window = mainWindow
  MainGlobals.obs = new OBSManager()

  manageWindow(mainWindow)

  if (process.argv.includes("--hidden"))
    SystemManager.toTray(mainWindow, true)
};

app.on('second-instance', () => {
  // Someone tried to run a second instance, we should focus our window.
  let w = MainGlobals.window;
  console.log("Second instance", w.isDestroyed())
  if(w.isDestroyed()) {
    MainGlobals.window = SystemManager.createWindow()
    w = MainGlobals.window
  }
  if (w) {
    if (w.isMinimized())
      return SystemManager.toTray(w, false)

    w.focus()
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


const handleExit = () => {
  logger.debug("Handling exit already shutdown:", alreadyShutdown, "...")
  if (alreadyShutdown)
    return

  logger.log("Shutting down...")
  alreadyShutdown = true
  shutdownFuncs.map(e => e().catch(() => {/**/ }))
}

ipcMain.handle("quit-app", () => handleExit())
ipcMain.on("isDev", e => {
  e.returnValue = process.argv.slice(1).includes("dev")
})
app.on("will-quit", () => {
  handleExit()
})

registerFuncs.map(e => e())