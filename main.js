/* package.json中的main字段要指明你的app的主进程js
 *  如果没有指明，那默认是index.js
 */
const {
  app,
  BrowserWindow,
  protocol,
  ipcMain,
  net,
  Menu,
  dialog,
  autoUpdater,
  session,
  globalShortcut,
  shell
} = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const http = require('http');

startupEventHandle();

// 全局的window对象
let win;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  win = new BrowserWindow({
    title: 'electron-example',
    icon: path.join(__dirname, 'favicon.ico'),
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
  // 1、加载远程的页面
  // win.loadURL('http://localhost:8001/test.html');
  // 2、加载本地的页面
  win.loadURL(`file://${__dirname}/app/index.html`);

  // 窗口准备好显示
  win.once('ready-to-show', () => {
    win.show()
    // 打开chrome调试工具
    win.webContents.openDevTools()
  })

  // 窗口关闭
  win.on('closed', () => {
    win = null;
  });

  // 注册自定义协议，返回本地文件
  protocol.registerFileProtocol('self', (request, callback) => {
    const url = request.url.substr(7);
    console.log(url);
    callback({
      path: path.normalize(`${__dirname}/${url}`)
    })
  }, (err) => {
    if (err) {
      console.error(err.stack);
    }
  });

  // 注册检测更新的方法
  updateHandle()

  // 设置菜单
  setMenu()
  // 设置快捷键
  setShortcut()
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

// 设置菜单
function setMenu() {
  const template = [{
      id: '0',
      submenu: [{
        id: '0-1',
        label: '退出',
        role: 'quit'
      }]
    }, {
      id: '1',
      label: '管理',
      submenu: [{
          id: '1-1',
          label: '导入数据包',
          click() { // 导入数据包
            dialog.showOpenDialog(win, {
              title: '离线数据包',
              properties: ['openFile'],
              filters: [{
                name: 'Zip',
                extensions: ['zip']
              }]
            }, () => {
              console.log('导入成功')
              win.webContents.send('message', '导入成功')
            });
          }
        },
        {
          id: '1-2',
          label: '导出面试结果',
          click() { // 导出数据包
            dialog.showSaveDialog(win, {
              title: '面试结果',
              filters: [{
                name: 'Zip',
                extensions: ['zip']
              }]
            }, () => {
              console.log('导出成功')
              win.webContents.send('message', '导出成功')
            });
          }
        },
        {
          id: '1-3',
          label: '打开PPT',
          click() {
            var result = shell.openItem(path.join(__dirname, 'electron.pptx'))
            console.log(path.join(__dirname, 'electron.pptx'))
            console.log(result)
          }
        },
        {
          id: '1-4',
          label: '打开Electron官网',
          click() {
            var result = shell.openExternal('https://electronjs.org/')
          }
        },
        {
          id: '1-5',
          label: '打开ZhaoCheng的github',
          click() {
            var result = shell.openExternal('https://github.com/zcbenz')
          }
        }
      ]
    },
    {
      id: '2',
      label: '编辑',
      submenu: [{
          id: '2-1',
          label: '撤销',
          role: 'undo'
        },
        {
          id: '2-2',
          label: '重做',
          role: 'redo'
        },
        {
          id: '2-3',
          label: '分割线',
          type: 'separator'
        },
        {
          id: '2-4',
          label: '剪切',
          role: 'cut'
        },
        {
          id: '2-5',
          label: '复制',
          role: 'copy'
        },
        {
          id: '2-6',
          label: '粘贴',
          role: 'paste'
        },
        {
          id: '2-7',
          label: '保持样式粘贴',
          role: 'pasteandmatchstyle'
        },
        {
          id: '2-8',
          label: '删除',
          role: 'delete'
        },
        {
          id: '2-9',
          label: '全选',
          role: 'selectall'
        }
      ]
    },
    {
      id: '3',
      label: '视图',
      submenu: [{
          id: '3-1',
          label: '刷新',
          role: 'reload'
        },
        {
          id: '3-2',
          label: '强制刷新',
          role: 'forcereload'
        },
        {
          id: '3-3',
          label: '开发者工具',
          role: 'toggledevtools'
        },
        {
          id: '3-4',
          label: '分割线',
          type: 'separator'
        },
        {
          id: '3-5',
          label: '实际尺寸',
          role: 'resetzoom'
        },
        {
          id: '3-6',
          label: '放大',
          role: 'zoomin'
        },
        {
          id: '3-7',
          label: '缩小',
          role: 'zoomout'
        },
        {
          id: '3-8',
          label: '分割线',
          type: 'separator'
        },
        {
          id: '3-9',
          label: '全选',
          role: 'togglefullscreen'
        }
      ]
    },
    {
      id: '4',
      label: '窗口',
      submenu: [{
          id: '4-1',
          label: '最小化',
          role: 'minimize'
        },
        {
          id: '4-2',
          label: '关闭',
          role: 'close'
        }
      ]
    },
    {
      id: '5',
      label: '帮助',
      submenu: [{
        id: '5-1',
        label: '了解更多',
        click() {
          require('electron').shell.openExternal('http://www.zhaopin.com/');
        }
      }]
    }
  ]

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 设置快捷键
function setShortcut() {
  globalShortcut.register('CommandOrControl+X', () => {
    console.log('CommandOrControl+X is pressed')
  })
}

// 异步消息
ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg); // prints "ping"
  event.sender.send('asynchronous-reply', 'pong');
})
// 同步消息
ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg); // prints "ping"
  event.returnValue = 'pong';
})

// 异步设置菜单是否可用
ipcMain.on('setMenuEnable-listen', (event, arg) => {
  let menus = JSON.parse(arg);

  let tmpMenu = Menu.getApplicationMenu()
  if (tmpMenu && tmpMenu.items && tmpMenu.items.length > 0) {
    tmpMenu.items.forEach(item => {
      item.submenu.items.forEach(item1 => {
        menus.forEach(idObj => {
          if (idObj.id === item1.id) {
            item1.enabled = idObj.enabled
          }
        })
      })
    })
  }
  event.sender.send('setMenuEnable-reply', 'success');
})

/**
 * windows平台下的自动更新 开始
 */
// window平台下通过electron-squirrel-startup安装程序
function startupEventHandle() {
  if (require('electron-squirrel-startup')) return;
  let handleStartupEvent = function () {
    if (process.platform !== 'win32') {
      return false;
    }
    let squirrelCommand = process.argv[1];
    switch (squirrelCommand) {
      case '--squirrel-install':
      case '--squirrel-updated':
        install();
        return true;
      case '--squirrel-uninstall':
        uninstall();
        app.quit();
        return true;
      case '--squirrel-obsolete':
        app.quit();
        return true;
    }
    // 安装
    function install() {
      let cp = require('child_process');
      let updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
      let target = path.basename(process.execPath);
      let child = cp.spawn(updateDotExe, ["--createShortcut", target], {
        detached: true
      });
      child.on('close', function (code) {
        app.quit();
      });
    }
    // 卸载
    function uninstall() {
      let cp = require('child_process');
      let updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
      let target = path.basename(process.execPath);
      let child = cp.spawn(updateDotExe, ["--removeShortcut", target], {
        detached: true
      });
      child.on('close', function (code) {
        app.quit();
      });
    }
  };
  if (handleStartupEvent()) {
    return;
  }
}
// 检查更新
function updateHandle() {
  ipcMain.on('check-for-update', function (event, arg) {
    console.log('检查更新中...')

    if (process.platform !== 'win32') {
      return false;
    }
    
    let appName = '简历解析系统';
    let appIcon = __dirname + '/favicon.ico';
    let message = {
      updateAva: '下载更新成功',
      downloaded: '最新版本已下载，将在重启程序后更新'
    };

    // 设置更新检查的服务器路径
    autoUpdater.setFeedURL("http://127.0.0.1:8001/publish");
    // 标记是否更新
    let selectUpdate = true;

    autoUpdater.on('error', function (error) {
        // 检查更新报错时调用
        // return dialog.showMessageBox(win, {
        //   type: 'error',
        //   icon: appIcon,
        //   buttons: ['确定'],
        //   title: appName,
        //   message: "检查更新出错",
        //   detail: '\r' + error
        // });
      })
      .on('checking-for-update', function (e) {
        // 检测更新时调用
      })
      .on('update-available', function (e) {
        // 更新可用时调用
        let downloadConfirmation = dialog.showMessageBox(win, {
          type: 'question',
          icon: appIcon,
          buttons: ['安装', '取消'],
          title: appName,
          message: "检测到最新版本，是否安装更新？"
        });
        if (downloadConfirmation === 1) {
          selectUpdate = false;
          return false;
        }
        return false;
      })
      .on('update-not-available', function (e) {
        // 下载更新不可用时调用
      })
      .on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
        if (!selectUpdate) {
          return;
        }

        let index = dialog.showMessageBox(win, {
          type: 'question',
          icon: appIcon,
          buttons: ['现在重启', '稍后重启'],
          title: appName,
          message: "最新版本已下载成功，将在重启程序后更新",
          detail: releaseName + "\n\n" + releaseNotes
        });

        // 稍后重启
        if (index === 1) {
          return;
        }
        // 立刻退出并且安装
        autoUpdater.quitAndInstall();
      });

    // 检查更新
    autoUpdater.checkForUpdates();
  });
}
/**
 * windows平台下的自动更新 结束
 */

 /**
 * mac平台下的自动更新 开始
 */
// 你的应用程序必须签署 macOS 自动更新。 这是 Squirrel.Mac 的要求。
// 这意味着你必须要认证为 apple 开发者。
 /**
 * mac平台下的自动更新 开始
 */