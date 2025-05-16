import { app, autoUpdater, dialog } from 'electron';
import { is } from 'electron-util';
import log from 'electron-log';

// 配置日志
log.transports.file.level = 'info';
autoUpdater.logger = log;

// 检查平台
const isWin = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

// 设置更新服务器 URL
const repo = 'FengQingMo/ToolBox';
const updateServerHost = `https://github.com/${repo}/releases/latest`;

// 检查更新
export function checkForUpdates() {
  // 在开发环境中不检查更新
  if (!app.isPackaged) {
    log.info('开发环境，跳过更新检查');
    return;
  }

  // 不同平台使用不同的更新URL
  if (is.macos) {
    autoUpdater.setFeedURL({
      url: `https://github.com/${repo}/releases/download/v${app.getVersion()}`
    });
  } else if (is.windows) {
    autoUpdater.setFeedURL({
      url: `https://github.com/${repo}/releases/latest/download`
    });
  } else {
    log.info('当前平台不支持自动更新');
    return;
  }

  // 更新事件监听
  autoUpdater.on('checking-for-update', () => {
    log.info('正在检查更新...');
  });

  autoUpdater.on('update-available', (info) => {
    log.info('有可用更新', info);
    dialog.showMessageBox({
      type: 'info',
      title: '发现新版本',
      message: '发现新版本，是否立即更新？',
      buttons: ['立即更新', '稍后再说'],
      cancelId: 1
    }).then(({ response }) => {
      if (response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
  });

  autoUpdater.on('update-not-available', () => {
    log.info('已是最新版本');
  });

  autoUpdater.on('download-progress', (progressObj) => {
    log.info(`更新下载进度: ${progressObj.percent}%`);
  });

  autoUpdater.on('update-downloaded', () => {
    log.info('更新已下载，将在关闭时安装');
    dialog.showMessageBox({
      type: 'info',
      title: '安装更新',
      message: '更新已下载，将重启应用安装',
      buttons: ['重启安装', '稍后再说'],
      cancelId: 1
    }).then(({ response }) => {
      if (response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('error', (err) => {
    log.error('自动更新出错', err);
  });

  // 开始检查更新
  autoUpdater.checkForUpdates().catch(err => {
    log.error('检查更新失败', err);
  });
}

// 检查是否有更新
export function openUpdatePage() {
  const { shell } = require('electron');
  shell.openExternal(updateServerHost).catch(console.error);
} 