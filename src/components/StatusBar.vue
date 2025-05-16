<script setup>
// 状态栏组件
import { defineProps } from 'vue';

const props = defineProps({
  appInfo: {
    type: Object,
    default: () => ({ version: '0.1.0', platform: 'web' })
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
    
    <div class="status-item">
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
</style> 