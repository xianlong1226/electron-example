const {
  app,
  BrowserWindow,
  protocol,
  ipcMain,
  net,
  Menu,
  dialog,
  autoUpdater,
  session
} = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const http = require('http');

// 全局的window对象
let win;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  win = new BrowserWindow({
    title: 'electron-example',
    // icon: path.join(__dirname, 'favicon.ico'),
    width: 1200,
    height: 900,
    backgroundColor: '#fff', // 设置窗口背景色
    alwaysOnTop: false,
    fullscreen: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js') // 页面加载时首先执行这个js
    }
  });

  // 加载首页
  win.loadURL('http://localhost:8001/test.html');

  // 窗口准备好显示
  win.once('ready-to-show', () => {
    win.show()
    win.webContents.openDevTools ()
  })

  // 窗口关闭
  win.on('closed', () => {
    win = null;
  });

  // 注册请求拦截器
  requestInterceptor();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// 注册请求拦截器
function requestInterceptor(){
}