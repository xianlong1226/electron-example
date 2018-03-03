const gulp = require('gulp')
const clean = require('gulp-clean')
const fs = require('fs')

gulp.task('clean', function(){
  return gulp.src([
    '../appdist',
    '../publish'
  ]).pipe(clean({force: true}))
})

gulp.task('copy', ['clean'], function(){
  return gulp.src(['**/*', '!config.json', '!config.prod.json']).pipe(gulp.dest('../appdist'))
})

gulp.task('replacefile', ['copy'], function(callback) {
  fs.copyFileSync('./config.prod.json', '../appdist/config.json');
  return callback()
})

// windows下打包
gulp.task('win-packager', ['replacefile'], function(callback) {
  const packager = require('electron-packager')
  const path = require('path')
  
  // 全局变量
  let version = '1.0.1'
  let electronVersion = '1.7.9'
  let iconPath = path.join(__dirname, './favicon.ico')
  let sourchPath = path.join(__dirname, '../appdist')
  let publishPath = path.join(__dirname, '../publish')
  
  packager({
    dir: sourchPath,
    appVersion: version,
    arch: 'ia32',
    electronVersion: electronVersion,
    executableName: 'resume-parse',
    icon: iconPath,
    name: 'resume-parse',
    out: publishPath,
    overwrite: true,
    packageManager: 'npm',
    platform: 'win32',
    ignore: [/gulpfile.js/, /package-lock.json/, /config.prod.js/]
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
  let electronInstaller = require('electron-winstaller');
  let path = require('path')
  
  // 全局变量
  let version = '1.0.1'
  let appDirectory = path.join(__dirname, '../publish/resume-parse-win32-ia32')
  let publishPath = path.join(__dirname, '../publish/')
  
  resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: appDirectory,
    outputDirectory: publishPath,
    authors: 'xianlong.zeng',
    exe: 'resume-parse.exe',
    version: version,
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
gulp.task('darwin-packager', ['replacefile'], function(callback) {
  const packager = require('electron-packager')
  const path = require('path')
  
  // 全局变量
  let version = '1.0.0'
  let electronVersion = '1.6.11'
  let iconPath = path.join(__dirname, './favicon.ico.icns')
  let sourchPath = path.join(__dirname, '../appdist')
  let publishPath = path.join(__dirname, '../publish')
  
  packager({
    dir: sourchPath,
    appVersion: version,
    arch: 'x64',
    electronVersion: electronVersion,
    // executableName: 'resume-parse.exe',
    icon: iconPath,
    name: 'resume-parse',
    out: publishPath,
    overwrite: true,
    packageManager: 'npm',
    platform: 'darwin',
    ignore: [/gulpfile.js/, /package-lock.json/, /config.prod.js/]
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
  let path = require('path')
  
  // 全局变量
  let version = '1.0.0'
  let iconPath = path.join(__dirname, './favicon.ico.icns')
  let appDirectory = path.join(__dirname, '../publish/resume-parse-darwin-x64/resume-parse.app')
  let publishPath = path.join(__dirname, '../publish/')

  createDMG({
    name: 'resume-parse',
    appPath: appDirectory,
    icon: iconPath,
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
  console.log('success')
})

gulp.task('mac', ['darwin-installer'], function(){
  console.log('success')
})