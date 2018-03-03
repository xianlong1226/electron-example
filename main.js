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
//const session = require('session').defaultSession;
// const electronProxyAgent = require('electron-proxy-agent');
// const httpProxy = require('http-proxy');

// const proxy = httpProxy.createProxyServer({
//   target:'http://localhost:9000',
//   ssl: {
//     key: fs.readFileSync(path.join(__dirname, 'fixtures', 'agent2-key.pem')),
//     cert: fs.readFileSync(path.join(__dirname, 'fixtures', 'agent2-cert.pem')),
//     ciphers: 'AES128-GCM-SHA256',
//   },
//   //secure: true
// }).listen(8090);

// //
// // Create your target server
// //
// http.createServer(function (req, res) {
//   res.writeHead(200, { 'Content-Type': 'text/plain' });
//   res.write('request successfully proxied!' + '\n' + JSON.stringify(req.headers, true, 2));
//   res.end();
// }).listen(9000);

// 
// protocol.registerStandardSchemes(['https']);

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
      //preload: path.join(__dirname, 'assets/js/base.js') // 页面加载时首先执行这个js
    }
  });

  // 加载首页
  win.loadURL('http://exam.net.zhaopin.com');

  // 窗口准备好显示
  win.once('ready-to-show', () => {
    win.show()
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
  win.webContents.session.setProxy({ proxyRules: 'http=http://localhost:9000;https=https://localhost:9001' }, (result) => {
    console.log(result)
  })
  // 拦截http请求
  //protocol.interceptStringProtocol('https', (request, callback) => {
    // let data = ''
    // const request1 = net.request(request.url)
    // request1.on('login', (authInfo, callback) => {
    //   callback('username', 'password')
    // })
    // request1.on('response', (response) => {
    //   response.on('data', (chunk) => {
    //     data += chunk
    //     console.log(`BODY: ${chunk}`)
    //   })
    //   response.on('end', () => {
    //     console.log('response请求中没有更多数据。')
    //     return callback(data)
    //   })
    // })
    // request1.on('error', (error) => {
    //   console.log(error)
    // })
    // request1.end();
    //return callback(fs.readFileSync(path.join(__dirname + '/index.html'), 'utf8'));
  //});
}