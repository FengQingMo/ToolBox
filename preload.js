const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const { app } = require('@electron/remote');

// 确保密码存储目录存在
const ensurePasswordDirExists = () => {
  try {
    // 使用当前目录下的data文件夹
    const appDir = __dirname;
    const passwordDir = path.join(appDir, 'data');
    
    if (!fs.existsSync(passwordDir)) {
      fs.mkdirSync(passwordDir, { recursive: true });
    }
    
    return passwordDir;
  } catch (error) {
    console.error('无法创建密码存储目录:', error);
    return null;
  }
};

// 获取密码文件路径
const getPasswordFilePath = () => {
  const passwordDir = ensurePasswordDirExists();
  if (passwordDir) {
    return path.join(passwordDir, 'passwords.json');
  }
  return null;
};

// 确保二维码输出目录存在
const ensureQrCodeDirExists = () => {
  try {
    // 使用当前目录下的data文件夹
    const appDir = __dirname;
    const qrCodeDir = path.join(appDir, 'data', 'qrcodes');
    
    if (!fs.existsSync(qrCodeDir)) {
      fs.mkdirSync(qrCodeDir, { recursive: true });
    }
    
    return qrCodeDir;
  } catch (error) {
    console.error('无法创建二维码存储目录:', error);
    return null;
  }
};

// 通过上下文桥接向渲染进程暴露安全的API
contextBridge.exposeInMainWorld(
  'electron', {
    // 获取系统信息
    getAppInfo: () => ipcRenderer.invoke('get-app-info'),
    
    // 平台信息
    platform: process.platform,
    
    // 是否是暗黑模式
    isDarkMode: () => {
      if (window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return false;
    },
    
    // 读取密码数据
    readPasswords: async () => {
      try {
        const filePath = getPasswordFilePath();
        if (!filePath) return [];
        
        if (!fs.existsSync(filePath)) {
          return [];
        }
        
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      } catch (error) {
        console.error('读取密码数据失败:', error);
        return [];
      }
    },
    
    // 保存密码数据
    savePasswords: async (passwords) => {
      try {
        const filePath = getPasswordFilePath();
        if (!filePath) throw new Error('无法获取密码文件路径');
        
        const data = JSON.stringify(passwords, null, 2);
        fs.writeFileSync(filePath, data, 'utf8');
        return true;
      } catch (error) {
        console.error('保存密码数据失败:', error);
        throw error;
      }
    }
  }
); 