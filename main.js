import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import url from 'url';
import fs from 'fs';
import QRCode from 'qrcode';
import { initialize, enable } from '@electron/remote/main/index.js';
import isDev from 'electron-is-dev';
import { checkForUpdates } from './src/utils/update.js';

// Get current directory in ES Modules
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义应用数据目录
const dataDir = path.join(__dirname, 'data');

// 确保数据目录存在
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 设置日志文件
const logFile = path.join(dataDir, 'app.log');
console.log('日志文件路径:', logFile);

// 创建全局日志函数
const writeLog = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${message}\n`;
  fs.appendFileSync(logFile, logMessage, { encoding: 'utf8' });
};

// 记录应用启动
writeLog('===== 应用启动 =====');
writeLog(`应用路径: ${__dirname}`);
writeLog(`数据目录: ${dataDir}`);
writeLog(`Electron版本: ${process.versions.electron}`);
writeLog(`Node版本: ${process.versions.node}`);

// 确保密码存储目录存在
const ensurePasswordDirExists = () => {
  try {
    const passwordDir = path.join(dataDir, 'passwords');
    
    if (!fs.existsSync(passwordDir)) {
      fs.mkdirSync(passwordDir, { recursive: true });
      writeLog(`创建密码存储目录: ${passwordDir}`);
    }
    
    return passwordDir;
  } catch (error) {
    writeLog(`创建密码目录失败: ${error.message}`);
    return null;
  }
};

// 确保二维码输出目录存在
const ensureQrCodeDirExists = () => {
  try {
    const qrCodeDir = path.join(dataDir, 'qrcodes');
    
    if (!fs.existsSync(qrCodeDir)) {
      fs.mkdirSync(qrCodeDir, { recursive: true });
    }
    
    return qrCodeDir;
  } catch (error) {
    writeLog(`创建二维码目录失败: ${error.message}`);
    return null;
  }
};

initialize();

let mainWindow;

// 配置统一的更新检查

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true, // 启用 nodeIntegration
      contextIsolation: true, // 保持上下文隔离
      sandbox: false, // 禁用沙箱模式
      preload: path.resolve(__dirname, 'preload.js'),
      webSecurity: true,
      nodeIntegrationInWorker: true, // 允许在 Web Workers 中使用 Node.js
      enableRemoteModule: true // 启用远程模块
    },
    frame: true,
    backgroundColor: '#FFFFFF'
  });
  
  enable(mainWindow.webContents);

  // 添加错误处理
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    writeLog(`页面加载失败: ${errorDescription} (${errorCode})`);
    console.error('页面加载失败:', errorDescription, errorCode);
  });

  // 记录预加载脚本错误
  mainWindow.webContents.on('preload-error', (event, preloadPath, error) => {
    writeLog(`预加载脚本错误: ${preloadPath}, ${error}`);
    console.error('预加载脚本错误:', preloadPath, error);
  });

  // In production, load the built app
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    // In development, load from the dev server
    mainWindow.loadURL('http://localhost:5173/');
    // Open the DevTools automatically
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // 应用启动后检查更新
  if (!isDev) {
    setTimeout(() => {
      try {
        checkForUpdates();
        writeLog('启动更新检查');
      } catch (error) {
        writeLog(`更新检查失败: ${error.message}`);
      }
    }, 3000); // 延迟3秒检查更新
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Handle IPC messages from renderer process
ipcMain.handle('get-app-info', () => {
  return {
    version: app.getVersion(),
    platform: process.platform,
    appPath: app.getAppPath()
  };
});

// 处理二维码生成请求
ipcMain.handle('generate-qrcode', async (event, options) => {
  try {
    const { content, errorCorrectionLevel, version, colorized, margin, width, height, fileName } = options;
    
    if (!content) {
      throw new Error('二维码内容不能为空');
    }
    
    // 基本二维码配置
    const qrOptions = {
      errorCorrectionLevel: errorCorrectionLevel || 'H',
      version: version || undefined,
      margin: margin || 1,
      width: width || 256,
      color: {
        dark: colorized?.dark || '#000000',
        light: colorized?.light || '#FFFFFF'
      }
    };

    // 确保输出目录存在
    const outputDir = ensureQrCodeDirExists();
    if (!outputDir) {
      throw new Error('无法创建二维码存储目录');
    }
    
    // 生成文件名
    const timestamp = Date.now();
    const defaultFileName = `qrcode_${timestamp}`;
    const outputPath = path.join(outputDir, `${fileName || defaultFileName}.png`);
    
    // 生成二维码并保存为图片
    await QRCode.toFile(outputPath, content, qrOptions);
    
    // 返回二维码图片的路径
    return {
      success: true,
      filePath: outputPath,
      url: `file://${outputPath}`
    };
  } catch (error) {
    console.error('生成二维码失败:', error);
    return {
      success: false,
      error: error.message || '生成二维码失败'
    };
  }
});

// 添加更新相关的 IPC 处理
ipcMain.handle('check-for-updates', () => {
  if (!isDev) {
    checkForUpdates();
    return { success: true, message: '正在检查更新...' };
  }
  return { success: false, message: '开发环境不检查更新' };
});

ipcMain.handle('open-releases-page', () => {
  const { shell } = require('electron');
  shell.openExternal('https://github.com/FengQingMo/ToolBox/releases').catch(console.error);
  return { success: true };
});

ipcMain.handle('get-current-version', () => {
  return { version: app.getVersion() };
});

// 处理打开文件路径请求
ipcMain.handle('open-path-in-explorer', async (event, filePath) => {
  writeLog(`请求打开路径: ${filePath}`);
  if (filePath) {
    try {
      await shell.openPath(filePath);
      writeLog(`成功打开路径: ${filePath}`);
      return { success: true };
    } catch (error) {
      writeLog(`打开路径失败: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
  writeLog('打开路径失败: 未提供路径');
  return { success: false, error: 'File path is not provided' };
});

// 处理密码目录路径请求
ipcMain.handle('get-password-storage-path', () => {
  try {
    const passwordDir = ensurePasswordDirExists();
    writeLog(`获取密码存储路径: ${passwordDir}`);
    return passwordDir;
  } catch (error) {
    writeLog(`获取密码存储路径失败: ${error.message}`);
    return null;
  }
}); 