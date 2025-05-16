const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const remote = require('@electron/remote');
const app = remote.app;

// 定义路径 - 使用应用程序路径而不是预加载脚本路径
let rootDir;
try {
  // 尝试使用 remote.app 获取应用路径
  rootDir = app.getAppPath();
} catch (error) {
  // 如果失败，使用备用方法
  console.log('无法使用 remote.app 获取路径:', error);
  rootDir = process.env.APPDATA ? path.join(process.env.APPDATA, 'Toolbox') : __dirname;
}
console.log('应用根目录路径:', rootDir);
const dataDir = path.join(rootDir, 'data');

// 尝试确保数据目录存在
try {
  console.log('尝试创建或访问数据目录:', dataDir);
  
  // 检查路径是否存在
  const pathExists = fs.existsSync(dataDir);
  console.log('数据目录是否已存在:', pathExists);
  
  if (!pathExists) {
    // 确保父目录存在
    const parentDir = path.dirname(dataDir);
    if (!fs.existsSync(parentDir)) {
      console.log('创建父目录:', parentDir);
      fs.mkdirSync(parentDir, { recursive: true });
    }
    
    console.log('创建数据目录...');
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('数据目录已创建成功:', dataDir);
  } else {
    console.log('数据目录已存在，无需创建');
  }
} catch (error) {
  console.error('创建数据目录失败:', error);
  // 尝试使用备用方法
  try {
    const userHomeDir = process.env.USERPROFILE || process.env.HOME;
    const backupDataDir = path.join(userHomeDir, 'ToolboxData');
    console.log('尝试使用备用数据目录:', backupDataDir);
    if (!fs.existsSync(backupDataDir)) {
      fs.mkdirSync(backupDataDir, { recursive: true });
    }
    // 重新分配数据目录
    dataDir = backupDataDir;
    console.log('使用备用数据目录成功:', dataDir);
  } catch (backupError) {
    console.error('创建备用数据目录也失败:', backupError);
  }
}

// 日志函数
const writeLog = (message) => {
  try {
    // 检查 dataDir 是否已设置且存在
    if (!dataDir || !fs.existsSync(dataDir)) {
      console.warn('数据目录不存在，无法写入日志:', dataDir);
      return;
    }
    
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    
    // 构建日志文件路径并确保目录存在
    const logFile = path.join(dataDir, 'preload.log');
    
    // 使用同步方式写日志
    try {
      fs.appendFileSync(logFile, logMessage, { encoding: 'utf8' });
      console.log('日志已写入:', message);
    } catch (writeError) {
      console.error('写入日志文件失败:', writeError);
      
      // 尝试使用临时文件作为备用
      const tempLogFile = path.join(
        process.env.TEMP || process.env.TMP || 
        (process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Temp') : '.'),
        'toolbox_preload.log'
      );
      
      try {
        fs.appendFileSync(tempLogFile, logMessage, { encoding: 'utf8' });
        console.log('日志已写入临时文件:', tempLogFile);
      } catch (tempWriteError) {
        console.error('写入临时日志文件也失败:', tempWriteError);
      }
    }
  } catch (error) {
    console.error('写入日志过程中发生错误:', error);
  }
};

// 记录预加载启动
console.log('预加载脚本启动');
writeLog('===== Preload 脚本启动 =====');

// 确保密码存储目录存在
const ensurePasswordDirExists = () => {
  try {
    // 使用应用目录下的 data/passwords 文件夹
    const passwordDir = path.join(dataDir, 'passwords');
    
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
    // 使用应用目录下的 data/qrcodes 文件夹
    const qrCodeDir = path.join(dataDir, 'qrcodes');
    
    if (!fs.existsSync(qrCodeDir)) {
      fs.mkdirSync(qrCodeDir, { recursive: true });
    }
    
    return qrCodeDir;
  } catch (error) {
    console.error('无法创建二维码存储目录:', error);
    return null;
  }
};

// 安全地暴露 API 给渲染进程
try {
  const electronAPI = {
    // 版本信息
    versions: {
      node: () => process.versions.node,
      chrome: () => process.versions.chrome,
      electron: () => process.versions.electron
    },
    
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
        console.log('收到保存密码请求');
        const filePath = getPasswordFilePath();
        if (!filePath) {
          console.error('无法获取密码文件路径');
          throw new Error('无法获取密码文件路径');
        }
        
        // 确保密码数据可序列化
        const safePasswords = [];
        
        // 如果 passwords 是数组
        if (Array.isArray(passwords)) {
          for (const pwd of passwords) {
            // 只保留基本属性
            safePasswords.push({
              id: pwd.id || '',
              title: pwd.title || '',
              username: pwd.username || '',
              password: pwd.password || '',
              website: pwd.website || '',
              notes: pwd.notes || '',
              createdAt: pwd.createdAt || new Date().toISOString(),
              updatedAt: pwd.updatedAt || new Date().toISOString()
            });
          }
        } else {
          console.warn('保存密码失败: 输入不是数组', typeof passwords);
          throw new Error('密码数据格式错误，应为数组');
        }
        
        console.log(`准备保存 ${safePasswords.length} 个密码`);
        const data = JSON.stringify(safePasswords, null, 2);
        fs.writeFileSync(filePath, data, 'utf8');
        console.log('密码保存成功');
        return true;
      } catch (error) {
        console.error('保存密码数据失败:', error);
        // 不抛出异常，但返回错误信息
        return { success: false, error: error.message };
      }
    },

    // 获取密码存储路径
    getPasswordStoragePath: () => {
      console.log('收到获取密码存储路径请求');
      // 使用 IPC 通信
      return ipcRenderer.invoke('get-password-storage-path')
        .catch(() => {
          // 如果 IPC 失败，使用本地方法
          return ensurePasswordDirExists();
        });
    },

    // 打开路径
    openPathInExplorer: (filePath) => {
      console.log('收到打开路径请求:', filePath);
      // 使用 IPC 通信，主进程会处理路径打开
      return ipcRenderer.invoke('open-path-in-explorer', filePath);
    },
    
    // 自动更新相关
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    installUpdate: () => ipcRenderer.invoke('install-update'),
    
    // 更新事件监听
    onUpdateAvailable: (callback) => {
      ipcRenderer.on('update-available', (event, info) => callback(info));
    },
    onUpdateNotAvailable: (callback) => {
      ipcRenderer.on('update-not-available', (event, info) => callback(info));
    },
    onUpdateError: (callback) => {
      ipcRenderer.on('update-error', (event, error) => callback(error));
    },
    onUpdateProgress: (callback) => {
      ipcRenderer.on('update-progress', (event, progress) => callback(progress));
    },
    onUpdateDownloaded: (callback) => {
      ipcRenderer.on('update-downloaded', (event, info) => callback(info));
    },
    
    // 移除更新事件监听
    removeUpdateListeners: () => {
      ipcRenderer.removeAllListeners('update-available');
      ipcRenderer.removeAllListeners('update-not-available');
      ipcRenderer.removeAllListeners('update-error');
      ipcRenderer.removeAllListeners('update-progress');
      ipcRenderer.removeAllListeners('update-downloaded');
    },
    
    // IPC 通信方法
    ipc: {
      send: (channel, data) => {
        // 白名单 channels
        const validChannels = ['toMain'];
        if (validChannels.includes(channel)) {
          ipcRenderer.send(channel, data);
        }
      },
      receive: (channel, func) => {
        const validChannels = ['fromMain'];
        if (validChannels.includes(channel)) {
          ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
      },
      invoke: (channel, data) => {
        const validChannels = ['ping', 'generate-qrcode'];
        if (validChannels.includes(channel)) {
          return ipcRenderer.invoke(channel, data);
        }
      }
    }
  };

  // 暴露 API 给渲染进程
  contextBridge.exposeInMainWorld('electron', electronAPI);
  console.log('成功暴露 electron API');
} catch (error) {
  console.error('暴露 electron API 失败:', error);
} 