const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const QRCode = require('qrcode');
require('@electron/remote/main').initialize();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: true,
    backgroundColor: '#FFFFFF',
  });
  
  require('@electron/remote/main').enable(mainWindow.webContents);

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

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// 确保二维码输出目录存在
const ensureQrCodeDirExists = () => {
  try {
    // 获取用户数据目录
    const userDataDir = app.getPath('userData');
    const qrCodeDir = path.join(userDataDir, 'qrcodes');
    
    if (!fs.existsSync(qrCodeDir)) {
      fs.mkdirSync(qrCodeDir, { recursive: true });
    }
    
    return qrCodeDir;
  } catch (error) {
    console.error('无法创建二维码存储目录:', error);
    return null;
  }
};

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