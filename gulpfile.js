const gulp = require('gulp')
const clean = require('gulp-clean')
const fs = require('fs')
const path = require('path')

// 配置参数
const winVersion = '1.0.0'
const macVersion = '1.0.0'
const appName = 'electron-test'
let publishPath = path.join(__dirname, './publish')
let iconPath = path.join(__dirname, './favicon.ico')
let iconPath1 = path.join(__dirname, './favicon.ico.icns')

gulp.task('clean', function(){
  return gulp.src([
    './publish'
  ]).pipe(clean({force: true}))
})

// windows下打包
gulp.task('win-packager', ['clean'], function(callback) {
  const packager = require('electron-packager')
  
  packager({
    dir: './',
    appVersion: winVersion,
    arch: 'ia32',
    electronVersion: '1.7.9',
    executableName: appName,
    icon: iconPath,
    name: appName,
    out: publishPath,
    overwrite: true,
    packageManager: 'npm',
    platform: 'win32',
    ignore: [/gulpfile.js/, /package-lock.json/, /.vscode/, /website/, /website2/, /publish/]
  }, function (err, appPaths) {
    if (err) {
      return console.error(err.stack)
    }
  
    console.log('打包成功，生成文件位置：' + appPaths)
    callback()
  })
})

// windows下生成安装包
gulp.task('win-installer', ['win-packager'], function(callback) {
  let electronInstaller = require('electron-winstaller')
  
  // 全局变量
  let appDirectory = path.join(publishPath, appName + '-win32-ia32')
  
  resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: appDirectory,
    outputDirectory: publishPath,
    authors: 'xianlong.zeng',
    exe: appName + '.exe',
    version: winVersion,
    loadingGif: './install.gif'
  });
  
  resultPromise.then(() => { 
    console.log("安装包生成成功")
    callback()
  }, (err) => {
    console.error(err.stack)
  });
})

// mac下打包
gulp.task('darwin-packager', ['clean'], function(callback) {
  const packager = require('electron-packager')
  
  packager({
    dir: './',
    appVersion: macVersion,
    arch: 'x64',
    electronVersion: '1.6.11',
    icon: iconPath1,
    name: appName,
    out: publishPath,
    overwrite: true,
    packageManager: 'npm',
    platform: 'darwin',
    ignore: [/gulpfile.js/, /package-lock.json/, /.vscode/, /website/, /website2/, /publish/]
  }, function (err, appPaths) {
    if (err) {
      return console.error(err.stack)
    }
  
    console.log('打包成功，生成文件位置：' + appPaths)
    callback()
  })
})

// mac下生成安装包
gulp.task('darwin-installer', ['darwin-packager'], function (callback) {
  let createDMG = require('electron-installer-dmg')
  
  // 全局变量
  let appDirectory = path.join(publishPath, appName + '-darwin-x64/' + appName + '.app')

  createDMG({
    name: appName,
    appPath: appDirectory,
    icon: iconPath1,
    out: publishPath,
    overwrite: true
  }, function (err) { 
    if (err) {
      return console.error(err.stack)
    }

    console.log("安装包生成成功")
    callback()
  })
})

gulp.task('win', ['win-installer'], function(){
  console.log('execute success!')
})

gulp.task('mac', ['darwin-installer'], function(){
  console.log('execute success!')
})