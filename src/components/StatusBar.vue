<script setup>
// 状态栏组件
import { defineProps, ref, onMounted, onUnmounted, computed } from 'vue';
import { isElectronEnv, getElectronAPI } from '../utils/helper.js';

const props = defineProps({
  appInfo: {
    type: Object,
    default: () => ({ version: '0.1.0', platform: 'web' })
  }
});

// 获取安全的Electron API引用
const electronAPI = getElectronAPI();
const isElectron = isElectronEnv();

// 更新状态
const updateStatus = ref('idle'); // idle, checking, available, downloading, downloaded, error
const updateProgress = ref(0);
const updateError = ref('');

// 检查更新
const checkForUpdates = async () => {
  if (!isElectron) return;
  
  try {
    updateStatus.value = 'checking';
    await electronAPI.checkForUpdates();
  } catch (error) {
    console.error('检查更新失败:', error);
    updateStatus.value = 'error';
    updateError.value = error.message;
  }
};

// 安装更新
const installUpdate = () => {
  if (!isElectron) return;
  electronAPI.installUpdate();
};

// 监听更新事件
onMounted(() => {
  if (!isElectron) return;

  electronAPI.onUpdateAvailable((info) => {
    updateStatus.value = 'available';
  });

  electronAPI.onUpdateNotAvailable(() => {
    updateStatus.value = 'idle';
  });

  electronAPI.onUpdateError((error) => {
    updateStatus.value = 'error';
    updateError.value = error;
  });

  electronAPI.onUpdateProgress((progress) => {
    updateStatus.value = 'downloading';
    updateProgress.value = progress.percent;
  });

  electronAPI.onUpdateDownloaded(() => {
    updateStatus.value = 'downloaded';
  });
});

// 清理事件监听
onUnmounted(() => {
  if (isElectron) {
    electronAPI.removeUpdateListeners();
  }
});
</script>

<template>
  <footer class="status-bar">
    <div class="status-item">
      <span class="status-label">版本:</span>
      <span class="status-value">{{ appInfo.version }}</span>
    </div>
    
    <div class="status-item">
      <span class="status-label">平台:</span>
      <span class="status-value">{{ appInfo.platform }}</span>
    </div>
    
    <!-- 更新状态 -->
    <div class="status-item update-status" v-if="isElectron">
      <template v-if="updateStatus === 'idle'">
        <span class="status-dot online"></span>
        <span class="status-value">在线</span>
        <button class="update-btn" @click="checkForUpdates">检查更新</button>
      </template>
      
      <template v-else-if="updateStatus === 'checking'">
        <span class="status-dot checking"></span>
        <span class="status-value">检查更新中...</span>
      </template>
      
      <template v-else-if="updateStatus === 'available'">
        <span class="status-dot available"></span>
        <span class="status-value">发现新版本</span>
        <button class="update-btn" @click="checkForUpdates">下载更新</button>
      </template>
      
      <template v-else-if="updateStatus === 'downloading'">
        <span class="status-dot downloading"></span>
        <span class="status-value">下载更新中 {{ updateProgress.toFixed(1) }}%</span>
      </template>
      
      <template v-else-if="updateStatus === 'downloaded'">
        <span class="status-dot downloaded"></span>
        <span class="status-value">更新已下载</span>
        <button class="update-btn" @click="installUpdate">安装更新</button>
      </template>
      
      <template v-else-if="updateStatus === 'error'">
        <span class="status-dot error"></span>
        <span class="status-value">更新失败: {{ updateError }}</span>
        <button class="update-btn" @click="checkForUpdates">重试</button>
      </template>
    </div>
    
    <div class="status-item" v-else>
      <span class="status-dot online"></span>
      <span class="status-value">在线</span>
    </div>
  </footer>
</template>

<style scoped>
.status-bar {
  height: 30px;
  display: flex;
  align-items: center;
  padding: 0 var(--content-padding);
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 12px;
  margin-top: auto;
}

.status-item {
  display: flex;
  align-items: center;
  margin-right: var(--spacing-xl);
}

.status-label {
  font-weight: 500;
  margin-right: var(--spacing-xs);
}

.status-value {
  color: var(--text-tertiary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: var(--spacing-xs);
}

.status-dot.online {
  background-color: var(--success-color);
}

.status-dot.offline {
  background-color: var(--danger-color);
}

.status-dot.checking {
  background-color: var(--primary-color);
  animation: pulse 1s infinite;
}

.status-dot.available {
  background-color: var(--primary-color);
}

.status-dot.downloading {
  background-color: var(--primary-color);
  animation: pulse 1s infinite;
}

.status-dot.downloaded {
  background-color: var(--success-color);
}

.status-dot.error {
  background-color: var(--danger-color);
}

.update-btn {
  margin-left: var(--spacing-sm);
  padding: 2px 8px;
  font-size: 11px;
  border: 1px solid var(--primary-color);
  border-radius: var(--button-border-radius);
  background: transparent;
  color: var(--primary-color);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.update-btn:hover {
  background: var(--primary-color);
  color: white;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style> 