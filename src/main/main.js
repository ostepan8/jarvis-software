const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron");
// NOTE: Electron main process
const path = require("path");

let mainWindow;
let isClickThrough = false;

function createWindow() {
  // Create the browser window with JARVIS-like properties
  mainWindow = new BrowserWindow({
    width: 380,
    height: 200,
    minWidth: 300,
    minHeight: 150,
    maxWidth: 600,
    maxHeight: 400,
    frame: false, // Frameless window
    transparent: true, // Transparent background
    alwaysOnTop: true, // Always stay on top
    resizable: true, // Allow resizing
    skipTaskbar: true, // Don't show in taskbar
    hasShadow: false, // No window shadow
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false,
    },
  });

  // Load the app
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  // Position window at top-right corner initially
  const { screen } = require("electron");
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } =
    primaryDisplay.workAreaSize;

  mainWindow.setPosition(screenWidth - 470, 50);

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Register global shortcuts
  globalShortcut.register("CommandOrControl+J", () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  // Handle click-through toggle
  ipcMain.on("toggle-click-through", () => {
    isClickThrough = !isClickThrough;
    mainWindow.setIgnoreMouseEvents(isClickThrough);
    mainWindow.webContents.send("click-through-changed", isClickThrough);
  });

  // Handle close button
  ipcMain.on("close-app", () => {
    app.quit();
  });

  // Handle minimize button
  ipcMain.on("minimize-app", () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  // Handle window focus/blur for transparency effects
  mainWindow.on("blur", () => {
    mainWindow.webContents.send("window-blur");
  });

  mainWindow.on("focus", () => {
    mainWindow.webContents.send("window-focus");
  });

  // Open DevTools in development
  if (process.argv.includes("--dev")) {
    mainWindow.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Cleanup global shortcuts
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

// Handle app quit
app.on("before-quit", () => {
  if (mainWindow) {
    mainWindow.removeAllListeners("close");
    mainWindow.close();
  }
});
