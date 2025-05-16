// 检测系统的暗黑模式
export function detectDarkMode() {
  // 检查Electron API
  if (window.electron) {
    return window.electron.isDarkMode();
  }
  
  // 浏览器环境检测
  if (window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  
  // 默认返回false
  return false;
}

// 检查是否在Electron环境
export function isElectronEnv() {
  return window.electron !== undefined;
}

// 安全地获取Electron API
export function getElectronAPI() {
  return window.electron || {
    // 提供基本的虚拟实现，用于在浏览器环境中保持应用正常运行
    platform: 'web',
    getAppInfo: () => Promise.resolve({ version: '0.1.0', platform: 'web' }),
    readPasswords: () => Promise.resolve([]),
    savePasswords: () => Promise.resolve(true),
    isDarkMode: () => false,
    getPasswordStoragePath: () => Promise.resolve(''),
    openPathInExplorer: () => Promise.resolve({ success: false, error: '不在Electron环境中' }),
    // 其他API的虚拟实现...
  };
}

// 检查Electron环境并处理错误
export function checkElectronEnv(messageService) {
  if (!isElectronEnv()) {
    console.error('Electron API不可用，部分功能将无法使用');
    if (messageService) {
      return messageService.error('Electron环境检测失败', {
        title: '环境错误',
        message: 'window.electron对象不存在，部分功能将无法使用。这可能是由于预加载脚本未正确加载或沙箱配置问题。',
      });
    }
    return false;
  }
  return true;
}

// 安全地调用Electron API
export async function safeElectronCall(api, fallback, messageService) {
  if (!isElectronEnv()) {
    if (messageService) {
      messageService.warn('功能受限', {
        message: '此功能仅在Electron桌面应用中可用'
      });
    }
    return fallback;
  }
  
  try {
    const electron = getElectronAPI();
    return await api(electron);
  } catch (error) {
    console.error('Electron API调用失败:', error);
    if (messageService) {
      messageService.error('操作失败', {
        message: error.message || '未知错误'
      });
    }
    return fallback;
  }
} 