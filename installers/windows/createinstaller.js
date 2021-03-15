const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
  .then(createWindowsInstaller)
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })

function getInstallerConfig () {
  console.log('creating windows installer')
  const rootPath = path.join('./')
  const outPath = path.join(rootPath, 'release-builds')

  return Promise.resolve({
    appDirectory: path.join(outPath, 'transcoder/'),
    authors: 'AlexDacoda',
    noMsi: true,
    outputDirectory: path.join(outPath, 'windows-installer'),
    exe: 'video_trancoder.exe',
    setupExe: 'setup.exe',
    setupIcon: path.join(rootPath, 'img', 'icons', 'icon.ico')
  })
}