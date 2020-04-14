const electron = require("electron"),
  { app, Menu, Tray, dialog } = electron,
  path = require('path'),
  package = require('./package.json'),
  ipcMain = electron.ipcMain,
  { autoUpdater } = require('electron-updater'),
  feedUrl = 'http://xxx/download/',
  BrowserWindow = electron.BrowserWindow;

let mainWindow;

let otherWinList = []

function createWindow() {
  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 640,
    height: 480,
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadURL(`file://${__dirname}/pages/index.html`);
  //mainWindow.webContents.openDevTools();
  const tray = new Tray(path.join(__dirname,"icon.ico"))
  const contextMenu = Menu.buildFromTemplate([
    {label: 'About', click: () => { openAboutDialog() }},
    {label: 'Question', click: () => { openNewWin({winName:'question'}) }},
    {label: 'Exit', click: () => { mainWindow.close(); }}
  ])
  tray.setContextMenu(contextMenu)

  mainWindow.on("close", () => {
    mainWindow.webContents.send("stop-server");
    tray.destroy();
    otherWinList.map(item=> typeof item.isDestroyed == 'function' && !item.isDestroyed() && item.close())
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  
}

function openAboutDialog() {
  dialog.showMessageBox({
    type: 'info',
    title: 'About',
    message: "Word Image Handler\r\nDescription: Upload Word Image to Server\r\nVersion: "+package.version+"\r\nAuthor & Support: zhoulongli@trip.com",
    buttons: ['OK'],
    noLink: true,
  })
}

function openNewWin ({ width, height, winName }) {
  
  let newWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: width || 890,
    height: height || 480,
    webPreferences: {
      nodeIntegration: true
    }
  });

  newWindow.loadURL(`file://${__dirname}/pages/${winName}.html`);

  newWindow.on("closed", () => {
    newWindow = null;
  });

  //newWindow.webContents.openDevTools()
  otherWinList.push(newWindow)
}

ipcMain.on('open-dev', () => {
  mainWindow.webContents.openDevTools()
})

ipcMain.on('update', (e, arg) => {
  checkForUpdate()
})

/**
 * 以下为自动更新部分
 */
function sendUpdateMessage (message, data) {
  console.log('sendMsg:', {message, data})
  mainWindow.webContents.send('message', { message, data })
}

let checkForUpdate = () => {
  autoUpdater.setFeedURL(feedUrl)

  autoUpdater.on('error', (e, message) => {
    sendUpdateMessage('error', message)
  })

  autoUpdater.on('checking-for-update', (e, message) => {
    sendUpdateMessage('checking-for-update', message)
  })

  autoUpdater.on('update-available', (e, message) => {
    sendUpdateMessage('update-available', message)
  })

  autoUpdater.on('update-not-available', (e, message) => {
    sendUpdateMessage('update-not-available', message)
  })

  autoUpdater.on('download-progress', (e, message) => {
    sendUpdateMessage('download-progress', message)
  })

  autoUpdater.on('update-downloaded', (e, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) => {
    sendUpdateMessage('isUpdateNow')
    ipcMain.on('updateNow', (e, message) => {
      autoUpdater.quitAndInstall()
    })
  })

  autoUpdater.checkForUpdates()
}

/**
 * 注册WIH协议，在页面可以通过  WIH://  链接唤起应用
 */
app.setAsDefaultProtocolClient('WIH')

/**
 * 获取独占锁，保证只有一个应用在运行
 */
const gotTheLock = app.requestSingleInstanceLock()
if(!gotTheLock){
  app.quit()
} else {
  app.on('second-instance', e =>{
    if(mainWindow){
      mainWindow.focus()
    }
  })
}

app.on("ready", createWindow);
app.on("browser-window-created", function(e, window) {
  window.setMenu(null);
});

app.on("window-all-closed", function() {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function() {
  if (mainWindow === null) {
    createWindow();
  }
});
