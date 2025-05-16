<script setup>
import { ref, computed, watch } from 'vue';

// Props and emit
const props = defineProps({
  currentCategory: {
    type: String,
    required: true
  },
  activeTools: {
    type: Array,
    default: () => []
  },
  darkMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['change-category', 'open-tool']);

// 导航分类
const categories = ref([
  { id: 'all', name: '所有工具', icon: 'grid' }
]);

// 处理类别选择
const selectCategory = (categoryId) => {
  emit('change-category', categoryId);
};

// 打开指定工具
const openTool = (toolId) => {
  emit('open-tool', toolId);
};
</script>

<template>
  <aside class="sidebar" :class="{ 'dark-mode': darkMode }">
    <div class="sidebar-header">
      <h1 class="logo">工具箱</h1>
    </div>
    
    <nav class="nav-menu">
      <ul>
        <!-- 分类导航项 -->
        <li v-for="category in categories" :key="category.id">
          <button 
            class="nav-item" 
            :class="{ active: currentCategory === category.id }"
            @click="selectCategory(category.id)"
          >
            <span class="nav-icon">
              <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="10" v-if="category.icon === 'grid'" />
                <rect x="4" y="4" width="16" height="16" rx="2" v-else />
              </svg>
            </span>
            <span class="nav-label">{{ category.name }}</span>
          </button>
        </li>
        
        <!-- 活跃工具导航项 -->
        <li v-if="activeTools.length > 0" class="divider"></li>
        
        <li v-for="tool in activeTools" :key="tool.id">
          <button 
            class="nav-item" 
            :class="{ active: currentCategory === tool.id }"
            @click="openTool(tool.id)"
          >
            <span class="nav-icon">
              <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
                <!-- 工具图标 - 保持与 ToolGrid 一致 -->
                <rect x="4" y="4" width="16" height="16" v-if="tool.icon === 'calculator'" />
                <path d="M12 2 L22 12 L12 22 L2 12 Z" v-else-if="tool.icon === 'zap'" />
                <path d="M3 6 H21 M3 12 H21 M3 18 H21" v-else-if="tool.icon === 'align-left'" />
                <path d="M3 12 H21 M12 3 V21" v-else-if="tool.icon === 'tool'" />
                <path d="M20 4 L4 20 M4 4 L20 20" v-else-if="tool.icon === 'code'" />
                <circle cx="12" cy="12" r="10" v-else-if="tool.icon === 'globe'" />
                <path d="M4 12 A8 8 0 1 0 20 12 A8 8 0 1 0 4 12" v-else-if="tool.icon === 'repeat'" />
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" v-else-if="tool.icon === 'sun'" />
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" v-else-if="tool.icon === 'moon'" />
                <!-- 密码管理器图标 - 锁形状 -->
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" v-else-if="tool.icon === 'password'" />
                <!-- 二维码图标 -->
                <path d="M3 11h2v2H3v-2m8-6h2v12h-2V5m-4 8h2v4H7v-4m12-8h2v12h-2V5z" v-else-if="tool.icon === 'qrcode'" />
                <rect x="4" y="4" width="16" height="16" rx="2" v-else />
              </svg>
            </span>
            <span class="nav-label">{{ tool.name }}</span>
          </button>
        </li>
      </ul>
    </nav>
    
    <div class="sidebar-footer">
      <p>工具箱 v0.1.0</p>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--bg-tertiary);
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: background-color var(--transition-normal), border-color var(--transition-normal);
}

.sidebar.dark-mode {
  background-color: #1a1a1a;
  border-right-color: #333333;
  color: #ffffff;
}

.sidebar-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--bg-tertiary);
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
}

.nav-menu {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md) 0;
}

.nav-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.divider {
  height: 1px;
  background-color: var(--bg-tertiary);
  margin: var(--spacing-md) var(--spacing-md);
}

.nav-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  width: 100%;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  color: var(--text-secondary);
  border-left: 3px solid transparent;
  transition: all var(--transition-fast);
}

.nav-item:hover {
  background-color: var(--bg-tertiary);
}

.nav-item.active {
  color: var(--primary-color);
  border-left-color: var(--primary-color);
  background-color: rgba(43, 115, 255, 0.05);
}

.dark-mode .nav-item {
  color: #aaaaaa;
}

.dark-mode .nav-item:hover {
  background-color: #333333;
}

.dark-mode .nav-item.active {
  color: #4d9fff;
  border-left-color: #4d9fff;
  background-color: rgba(77, 159, 255, 0.1);
}

.nav-icon {
  margin-right: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-label {
  font-weight: 500;
}

.sidebar-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--bg-tertiary);
  font-size: 0.8rem;
  color: var(--text-tertiary);
}
</style> 