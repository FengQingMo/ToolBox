<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  category: {
    type: String,
    required: true
  },
  darkMode: {
    type: Boolean,
    default: false
  },
  searchQuery: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['open-tool', 'toggle-dark-mode']);

// 搜索状态
const searchQuery = ref('');

// 同步props.searchQuery到本地状态
watch(() => props.searchQuery, (newVal) => {
  searchQuery.value = newVal;
}, { immediate: true });

// 工具数据
const tools = ref([
  {
    id: 'password-manager',
    name: '密码保管箱',
    description: '安全地存储和管理您的密码',
    category: 'utilities',
    icon: 'password'
  },
  {
    id: 'qrcode-generator',
    name: '二维码生成器',
    description: '创建普通和艺术二维码',
    category: 'utilities',
    icon: 'qrcode'
  }
]);

// 过滤后的工具列表
const filteredTools = computed(() => {
  if (!searchQuery.value) {
    return tools.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return tools.value.filter(tool => 
    tool.name.toLowerCase().includes(query) || 
    tool.description.toLowerCase().includes(query)
  );
});

// 打开工具
const openTool = (toolId) => {
  emit('open-tool', toolId);
};

// 切换暗黑模式
const toggleDarkMode = () => {
  emit('toggle-dark-mode');
};

// 清除搜索
const clearSearch = () => {
  searchQuery.value = '';
};
</script>

<template>
  <div class="tool-grid-container" :class="{ 'dark-mode': darkMode }">
    <!-- 集成 header -->
    <header class="header" v-if="category === 'all'">
      <div class="search-bar">
        <svg class="icon search-icon" viewBox="0 0 24 24" width="18" height="18">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input 
          type="text" 
          placeholder="搜索工具..." 
          class="search-input"
          v-model="searchQuery"
        />
        <button 
          v-if="searchQuery" 
          @click="clearSearch" 
          class="search-clear"
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="header-actions">
        <button class="btn-icon" @click="emit('toggle-dark-mode')" title="切换夜间模式">
          <svg v-if="darkMode" class="icon" viewBox="0 0 24 24" width="20" height="20">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <svg v-else class="icon" viewBox="0 0 24 24" width="20" height="20">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
        
        <button class="btn-icon" title="设置">
          <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </header>

    <!-- 工具网格 -->
    <div class="tool-grid">
      <div 
        v-for="tool in filteredTools" 
        :key="tool.id" 
        class="tool-card"
        @click="openTool(tool.id)"
      >
        <div class="tool-icon">
          <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
            <!-- 密码管理器图标 - 锁形状 -->
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" v-if="tool.icon === 'password'" />
            <!-- 二维码图标 -->
            <path d="M3 11h2v2H3v-2m8-6h2v12h-2V5m-4 8h2v4H7v-4m12-8h2v12h-2V5z" v-else-if="tool.icon === 'qrcode'" />
            <!-- 默认图标 -->
            <rect x="4" y="4" width="16" height="16" v-else />
          </svg>
        </div>
        <div class="tool-details">
          <h3 class="tool-name">{{ tool.name }}</h3>
          <p class="tool-description">{{ tool.description }}</p>
        </div>
      </div>
      
      <div v-if="filteredTools.length === 0" class="empty-state">
        <p>没有找到匹配的工具。</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tool-grid-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--content-padding);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color var(--transition-normal), color var(--transition-normal);
}

.tool-grid-container.dark-mode {
  background-color: #1a1a1a;
  color: #ffffff;
}

.header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--content-padding);
  border-bottom: 1px solid var(--bg-tertiary);
  background-color: var(--bg-primary);
  transition: background-color var(--transition-normal);
  margin-bottom: var(--spacing-lg);
}

.search-bar {
  position: relative;
  width: 400px;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border-radius: 6px;
  border: 1px solid var(--bg-tertiary);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(43, 115, 255, 0.2);
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}

.search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.search-clear svg {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}

.search-clear:hover {
  color: var(--danger-color);
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--bg-tertiary);
  cursor: pointer;
  transition: background-color var(--transition-fast), transform var(--transition-fast);
}

.btn-icon:hover {
  background-color: var(--bg-tertiary);
  transform: translateY(-2px);
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
}

.tool-card {
  background-color: var(--bg-secondary);
  border-radius: var(--card-border-radius);
  padding: var(--spacing-lg);
  display: flex;
  cursor: pointer;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.tool-icon {
  background-color: rgba(43, 115, 255, 0.1);
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-md);
  color: var(--primary-color);
  flex-shrink: 0;
}

.tool-details {
  flex: 1;
}

.tool-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}

.tool-description {
  font-size: 14px;
  color: var(--text-secondary);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-tertiary);
}
</style> 