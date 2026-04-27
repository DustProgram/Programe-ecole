const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const fs   = require('fs')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Base de Prix & DPGF',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false
    }
  })
  win.loadFile('index.html')
  win.setMenuBarVisibility(false)
}

// ── Helper : restaure le focus à la fenêtre après une dialog Windows ──
// Bug Electron/Windows : après showOpenDialog/showSaveDialog, le focus
// reste "flottant" et le clavier ne réécrit plus dans l'app.
function restoreFocus() {
  if (!win || win.isDestroyed()) return
  // Double appel pour forcer Windows à libérer le focus de la dialog
  setImmediate(() => {
    if (win && !win.isDestroyed()) {
      win.focus()
      win.webContents.focus()
    }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.handle('open-file', async (e, filters) => {
  const result = await dialog.showOpenDialog(win, {
    title: 'Ouvrir un fichier',
    filters: filters || [{ name: 'Excel', extensions: ['xlsx', 'xlsm'] }],
    properties: ['openFile']
  })
  restoreFocus()
  if (result.canceled || !result.filePaths.length) return null
  const filePath = result.filePaths[0]
  const buffer   = fs.readFileSync(filePath)
  return { path: filePath, data: buffer.toString('base64') }
})

ipcMain.handle('save-file', async (e, { defaultName, filters, data }) => {
  const result = await dialog.showSaveDialog(win, {
    title: 'Enregistrer',
    defaultPath: defaultName || 'fichier.xlsx',
    filters: filters || [{ name: 'Excel', extensions: ['xlsx'] }]
  })
  restoreFocus()
  if (result.canceled || !result.filePath) return null
  const buffer = Buffer.from(data, 'base64')
  fs.writeFileSync(result.filePath, buffer)
  return result.filePath
})

ipcMain.handle('read-file', async (e, filePath) => {
  if (!fs.existsSync(filePath)) return null
  const buffer = fs.readFileSync(filePath)
  return buffer.toString('base64')
})

// Écriture avec gestion d'erreur (fichier ouvert dans Excel par ex.)
ipcMain.handle('write-file', async (e, { filePath, data }) => {
  try {
    const buffer = Buffer.from(data, 'base64')
    fs.writeFileSync(filePath, buffer)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('open-external', async (e, filePath) => {
  shell.openPath(filePath)
})

ipcMain.handle('show-in-folder', async (e, filePath) => {
  shell.showItemInFolder(filePath)
})

ipcMain.handle('choose-folder', async () => {
  const result = await dialog.showOpenDialog(win, {
    title: 'Choisir un dossier',
    properties: ['openDirectory']
  })
  restoreFocus()
  if (result.canceled || !result.filePaths.length) return null
  return result.filePaths[0]
})

ipcMain.handle('file-exists', async (e, filePath) => {
  try { return fs.existsSync(filePath) } catch { return false }
})

ipcMain.handle('file-mtime', async (e, filePath) => {
  try { return fs.statSync(filePath).mtimeMs } catch { return null }
})
