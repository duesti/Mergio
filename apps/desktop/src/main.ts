import path from "node:path";
import { app, BrowserWindow, ipcMain } from "electron";

function createWindow(): void {
	const win = new BrowserWindow({
		width: 1200,
		height: 800,
		minHeight: 800,
		minWidth: 800,
		frame: false,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			preload: path.join(__dirname, "../dist/preload.js"),
		},
	});

	const isDev = !app.isPackaged;

	if (isDev) {
		win.loadURL("http://localhost:3000");
		win.webContents.openDevTools();
	} else {
		win.loadFile(path.join(__dirname, "../../frontend/dist/index.html"));
	}

	ipcMain.on("window-minimize", () => win.minimize());

	ipcMain.on("window-maximize", () => {
		if (win.isMaximized()) {
			win.unmaximize();
		} else {
			win.maximize();
		}
	});

	ipcMain.on("window-close", () => win.close());

	win.on("closed", () => {
		ipcMain.removeAllListeners("window-minimize");
		ipcMain.removeAllListeners("window-maximize");
		ipcMain.removeAllListeners("window-close");
	});
}

app.whenReady().then(() => {
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
