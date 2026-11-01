// Electron 桌面壳：加载 Vite 构建产物 dist/index.html
const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 860,
    backgroundColor: '#15171c',
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  })
  win.loadFile(path.join(__dirname, 'dist', 'index.html'))
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
