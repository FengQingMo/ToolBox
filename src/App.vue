<script setup>
import { ref, onMounted, onBeforeMount, computed } from 'vue';
import SidebarNav from './components/SidebarNav.vue';
import StatusBar from './components/StatusBar.vue';
import ToolGrid from './components/ToolGrid.vue';
import PasswordManager from './components/tools/PasswordManager.vue';
import QrCodeGenerator from './components/tools/QrCodeGenerator.vue';

// App state
const darkMode = ref(false);
const currentCategory = ref('all');
const searchQuery = ref('');
const appInfo = ref({ version: '0.1.0', platform: 'web' });

// 活跃工具管理
const activeTools = ref([]);
const currentTool = ref(null);

// 检查系统是否为暗黑模式
onBeforeMount(() => {
  // 检查是否在Electron环境中
  if (window.electron) {
    darkMode.value = window.electron.isDarkMode();
    document.body.classList.toggle('dark-mode', darkMode.value);
  } else {
    // 浏览器环境中检查暗黑模式
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      darkMode.value = true;
      document.body.classList.add('dark-mode');
    }
  }
});

// 获取应用信息
onMounted(async () => {
  if (window.electron) {
    try {
      appInfo.value = await window.electron.getAppInfo();
      console.log('App info:', appInfo.value);
    } catch (error) {
      console.error('Failed to get app info:', error);
    }
  }

  // 从本地存储加载活跃工具
  loadActiveTools();
});

// 切换暗黑模式
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
  document.body.classList.toggle('dark-mode', darkMode.value);
};

// 切换分类
const changeCategory = (category) => {
  console.log('Changing category to:', category);
  currentCategory.value = category;
  currentTool.value = null;
};

// 打开工具
const openTool = (toolId) => {
  console.log('Opening tool:', toolId);
  
  // 如果工具已经在活跃列表中，直接切换到它
  if (activeTools.value.find(tool => tool.id === toolId)) {
    currentCategory.value = toolId;
    currentTool.value = toolId;
    return;
  }
  
  // 添加工具到活跃列表
  const toolData = getToolData(toolId);
  if (toolData) {
    activeTools.value.push(toolData);
    currentCategory.value = toolId;
    currentTool.value = toolId;
    
    // 保存活跃工具到本地存储
    saveActiveTools();
  }
};

// 获取工具数据
const getToolData = (toolId) => {
  const toolMap = {
    'password-manager': {
      id: 'password-manager',
      name: '密码保管箱',
      icon: 'password'
    },
    'qrcode-generator': {
      id: 'qrcode-generator',
      name: '二维码生成器',
      icon: 'qrcode'
    }
  };
  
  return toolMap[toolId];
};

// 保存活跃工具到本地存储
const saveActiveTools = () => {
  try {
    localStorage.setItem('activeTools', JSON.stringify(activeTools.value));
  } catch (error) {
    console.error('Failed to save active tools:', error);
  }
};

// 从本地存储加载活跃工具
const loadActiveTools = () => {
  try {
    const savedTools = localStorage.getItem('activeTools');
    if (savedTools) {
      activeTools.value = JSON.parse(savedTools);
    }
  } catch (error) {
    console.error('Failed to load active tools:', error);
  }
};

// 处理工具搜索
const handleToolSearch = (query) => {
  searchQuery.value = query;
};

// 判断当前是否显示工具网格
const showToolGrid = computed(() => {
  return currentCategory.value === 'all' || !currentTool.value;
});

// 面包屑文本
const breadcrumbText = computed(() => {
  if (currentTool.value) {
    const tool = activeTools.value.find(t => t.id === currentTool.value);
    return tool ? tool.name : '';
  }
  return '';
});
</script>

<template>
  <div :class="['app-container', { 'dark-mode': darkMode }]">
    <!-- 左侧导航 -->
    <SidebarNav 
      :current-category="currentCategory"
      :active-tools="activeTools"
      @change-category="changeCategory" 
      @open-tool="openTool"
    />
    
    <!-- 右侧主要内容区域 -->
    <main class="main-content">
    
      
      <!-- 内容区域 -->
      <div class="content-area">
        <!-- 工具网格 - 主页 -->
        <ToolGrid 
          v-if="showToolGrid"
          :category="currentCategory" 
          :search-query="searchQuery"
          @open-tool="openTool"
        />
        
        <!-- 工具组件 -->
        <PasswordManager v-if="currentTool === 'password-manager'" />
        <QrCodeGenerator v-if="currentTool === 'qrcode-generator'" />
      </div>
      
      <!-- 底部状态栏 -->
      <StatusBar :app-info="appInfo" />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-primary);
  transition: background-color var(--transition-normal);
}

.breadcrumb {
  padding: var(--spacing-md) var(--content-padding);
  font-size: 14px;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--bg-tertiary);
  display: flex;
  align-items: center;
}

.breadcrumb-item {
  cursor: pointer;
}

.breadcrumb-item:hover {
  color: var(--primary-color);
}

.breadcrumb-item.active {
  color: var(--primary-color);
  font-weight: 500;
}

.breadcrumb-separator {
  margin: 0 8px;
}

.content-area {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 1200px) {
  .content-area {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .content-area {
    padding: 12px;
  }
}
</style>
