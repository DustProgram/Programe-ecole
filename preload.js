const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openFile:      (filters)             => ipcRenderer.invoke('open-file', filters),
  saveFile:      (options)             => ipcRenderer.invoke('save-file', options),
  readFile:      (filePath)            => ipcRenderer.invoke('read-file', filePath),
  writeFile:     (filePath, data)      => ipcRenderer.invoke('write-file', { filePath, data }),
  openExternal:  (filePath)            => ipcRenderer.invoke('open-external', filePath),
  showInFolder:  (filePath)            => ipcRenderer.invoke('show-in-folder', filePath),
  chooseFolder:  ()                    => ipcRenderer.invoke('choose-folder'),
  fileExists:    (filePath)            => ipcRenderer.invoke('file-exists', filePath),
  fileMtime:     (filePath)            => ipcRenderer.invoke('file-mtime', filePath),
  isElectron: true
})
