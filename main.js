const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron')
const path = require('path')
const fs   = require('fs')
const { autoUpdater } = require('electron-updater')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Base de Prix',
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

  // Lancer la vérification de mise à jour 5 sec après le démarrage
  // (laisse le temps à l'app de se charger sans gêner l'utilisateur)
  setTimeout(() => {
    if (!app.isPackaged) return // pas en dev, uniquement en production
    autoUpdater.checkForUpdates().catch(err => {
      console.log('Vérification mise à jour échouée (silencieux):', err.message)
    })
  }, 5000)
}

// Helper : restaure le focus à la fenêtre après une dialog Windows
function restoreFocus() {
  if (!win || win.isDestroyed()) return
  setImmediate(() => {
    if (win && !win.isDestroyed()) {
      win.focus()
      win.webContents.focus()
    }
  })
}

// ── AUTO-UPDATE ──
// Configuration : on ne télécharge pas automatiquement, on demande d'abord
autoUpdater.autoDownload = false

autoUpdater.on('update-available', async (info) => {
  const result = await dialog.showMessageBox(win, {
    type: 'info',
    title: 'Mise à jour disponible',
    message: `Une nouvelle version (${info.version}) est disponible !`,
    detail: 'Voulez-vous la télécharger et l\'installer maintenant ?\n\n' +
            'Le téléchargement se fera en arrière-plan, vous pourrez continuer à utiliser l\'application.\n\n' +
            'Une fois prêt, l\'application redémarrera pour finaliser l\'installation.',
    buttons: ['Plus tard', 'Télécharger maintenant'],
    defaultId: 1,
    cancelId: 0
  })
  if (result.response === 1) {
    autoUpdater.downloadUpdate()
  }
})

autoUpdater.on('update-downloaded', async (info) => {
  const result = await dialog.showMessageBox(win, {
    type: 'info',
    title: 'Mise à jour prête',
    message: `La mise à jour ${info.version} a été téléchargée.`,
    detail: 'L\'application va redémarrer pour terminer l\'installation.',
    buttons: ['Redémarrer maintenant', 'Plus tard'],
    defaultId: 0,
    cancelId: 1
  })
  if (result.response === 0) {
    autoUpdater.quitAndInstall()
  }
})

autoUpdater.on('error', (err) => {
  // Silencieux : ne pas embêter l'utilisateur si la vérification échoue (pas d'internet, etc.)
  console.log('Auto-update error (silencieux):', err.message)
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// ── IPC : ouverture de fichier ──
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

// ── IPC : Vérification manuelle de mise à jour (depuis Paramètres) ──
ipcMain.handle('check-for-updates', async () => {
  try {
    const result = await autoUpdater.checkForUpdates()
    if (result && result.updateInfo && result.updateInfo.version !== app.getVersion()) {
      return { hasUpdate: true, version: result.updateInfo.version, current: app.getVersion() }
    }
    return { hasUpdate: false, current: app.getVersion() }
  } catch (e) {
    return { hasUpdate: false, error: e.message, current: app.getVersion() }
  }
})

ipcMain.handle('get-app-version', () => app.getVersion())
