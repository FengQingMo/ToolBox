<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { v4 as uuidv4 } from 'uuid';

// 状态
const passwords = ref([]);
const showAddForm = ref(false);
const editingPasswordId = ref(null);
const searchQuery = ref('');

// 新密码表单
const newPassword = ref({
  title: '',
  username: '',
  password: '',
  website: '',
  notes: ''
});

// 显示密码状态
const passwordVisibility = ref({});

// 过滤后的密码列表
const filteredPasswords = computed(() => {
  if (!searchQuery.value) return passwords.value;
  
  const query = searchQuery.value.toLowerCase();
  return passwords.value.filter(pw => 
    pw.title.toLowerCase().includes(query) ||
    pw.username.toLowerCase().includes(query) ||
    pw.website.toLowerCase().includes(query) ||
    pw.notes.toLowerCase().includes(query)
  );
});

// 从文件加载密码
const loadPasswords = async () => {
  try {
    if (window.electron) {
      const data = await window.electron.readPasswords();
      if (data && Array.isArray(data)) {
        passwords.value = data;
      }
    } else {
      // 浏览器环境，从localStorage加载
      const savedPasswords = localStorage.getItem('passwords');
      if (savedPasswords) {
        passwords.value = JSON.parse(savedPasswords);
      }
    }
  } catch (error) {
    console.error('加载密码失败:', error);
  }
};

// 保存密码到文件
const savePasswords = async () => {
  try {
    if (window.electron) {
      await window.electron.savePasswords(passwords.value);
    } else {
      // 浏览器环境，保存到localStorage
      localStorage.setItem('passwords', JSON.stringify(passwords.value));
    }
  } catch (error) {
    console.error('保存密码失败:', error);
  }
};

// 添加新密码
const addPassword = async () => {
  if (!newPassword.value.title || !newPassword.value.password) {
    alert('名称和密码不能为空');
    return;
  }

  if (editingPasswordId.value) {
    // 更新现有密码
    const index = passwords.value.findIndex(pw => pw.id === editingPasswordId.value);
    if (index !== -1) {
      passwords.value[index] = {
        ...newPassword.value,
        id: editingPasswordId.value,
        updatedAt: new Date().toISOString()
      };
    }
  } else {
    // 添加新密码
    passwords.value.push({
      ...newPassword.value,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // 保存到文件
  await savePasswords();
  
  // 重置表单
  resetForm();
};

// 编辑密码
const editPassword = (id) => {
  const password = passwords.value.find(pw => pw.id === id);
  if (password) {
    newPassword.value = { ...password };
    editingPasswordId.value = id;
    showAddForm.value = true;
  }
};

// 删除密码
const deletePassword = async (id) => {
  if (confirm('确定要删除这个密码吗？此操作不可撤销。')) {
    passwords.value = passwords.value.filter(pw => pw.id !== id);
    await savePasswords();
    
    // 如果正在编辑被删除的密码，关闭表单
    if (editingPasswordId.value === id) {
      resetForm();
    }
  }
};

// 复制到剪贴板
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      alert('已复制到剪贴板');
    })
    .catch(err => {
      console.error('复制失败:', err);
    });
};

// 切换密码可见性
const togglePasswordVisibility = (id) => {
  passwordVisibility.value[id] = !passwordVisibility.value[id];
};

// 重置表单
const resetForm = () => {
  newPassword.value = {
    title: '',
    username: '',
    password: '',
    website: '',
    notes: ''
  };
  editingPasswordId.value = null;
  showAddForm.value = false;
};

// 生成随机密码
const generatePassword = () => {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+=-';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  newPassword.value.password = password;
};

// 生命周期钩子
onMounted(() => {
  loadPasswords();
});
</script>

<template>
  <div class="password-manager">
    <div class="tool-header">
      
      <div class="tool-actions">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索密码..."
            class="search-input"
          />
        </div>
        
        <button 
          class="btn btn-primary" 
          @click="showAddForm = !showAddForm; editingPasswordId = null;"
        >
          {{ showAddForm ? '取消' : '添加密码' }}
        </button>
      </div>
    </div>
    
    <!-- 添加/编辑密码表单 -->
    <div class="password-form" v-if="showAddForm">
      <h3>{{ editingPasswordId ? '编辑密码' : '添加新密码' }}</h3>
      
      <div class="form-group">
        <label for="title">名称 *</label>
        <input 
          type="text" 
          id="title" 
          v-model="newPassword.title" 
          placeholder="如：邮箱密码"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="username">用户名</label>
        <input 
          type="text" 
          id="username" 
          v-model="newPassword.username" 
          placeholder="用户名或邮箱地址"
        />
      </div>
      
      <div class="form-group password-field">
        <label for="password">密码 *</label>
        <input 
          type="password" 
          id="password" 
          v-model="newPassword.password" 
          placeholder="密码"
          required
        />
        <button 
          type="button" 
          class="btn-icon generate-btn" 
          @click="generatePassword"
          title="生成随机密码"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" class="icon">
            <path d="M12 2L1 12l3 3 8-8 8 8 3-3L12 2z" />
          </svg>
        </button>
      </div>
      
      <div class="form-group">
        <label for="website">网站</label>
        <input 
          type="text" 
          id="website" 
          v-model="newPassword.website" 
          placeholder="https://example.com"
        />
      </div>
      
      <div class="form-group">
        <label for="notes">备注</label>
        <textarea 
          id="notes" 
          v-model="newPassword.notes" 
          placeholder="其他相关信息..."
        ></textarea>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="resetForm">
          取消
        </button>
        <button type="button" class="btn btn-primary" @click="addPassword">
          {{ editingPasswordId ? '保存修改' : '保存' }}
        </button>
      </div>
    </div>
    
    <!-- 密码列表 -->
    <div class="password-list" v-if="!showAddForm">
      <div v-if="filteredPasswords.length === 0" class="empty-state">
        <p>{{ searchQuery ? '没有找到匹配的密码' : '没有保存的密码' }}</p>
        <button class="btn btn-primary" @click="showAddForm = true">添加第一个密码</button>
      </div>
      
      <div v-else class="password-cards">
        <div 
          v-for="password in filteredPasswords" 
          :key="password.id" 
          class="password-card"
        >
          <div class="card-header">
            <h3 class="card-title">{{ password.title }}</h3>
            <div class="card-actions">
              <button 
                class="btn-icon" 
                @click="editPassword(password.id)"
                title="编辑"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" class="icon">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
              </button>
              <button 
                class="btn-icon" 
                @click="deletePassword(password.id)"
                title="删除"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" class="icon">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="card-body">
            <div class="password-field" v-if="password.username">
              <span class="field-label">用户名:</span>
              <span class="field-value">{{ password.username }}</span>
              <button 
                class="btn-icon copy-btn" 
                @click="copyToClipboard(password.username)"
                title="复制用户名"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" class="icon">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
            
            <div class="password-field">
              <span class="field-label">密码:</span>
              <span class="field-value">
                {{ passwordVisibility[password.id] ? password.password : '••••••••' }}
              </span>
              <button 
                class="btn-icon toggle-btn" 
                @click="togglePasswordVisibility(password.id)"
                :title="passwordVisibility[password.id] ? '隐藏密码' : '显示密码'"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" class="icon">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              <button 
                class="btn-icon copy-btn" 
                @click="copyToClipboard(password.password)"
                title="复制密码"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" class="icon">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
            
            <div class="password-field" v-if="password.website">
              <span class="field-label">网站:</span>
              <a 
                class="field-value website-link" 
                :href="password.website.startsWith('http') ? password.website : 'https://' + password.website" 
                target="_blank"
              >
                {{ password.website }}
              </a>
            </div>
            
            <div class="password-field notes" v-if="password.notes">
              <span class="field-label">备注:</span>
              <span class="field-value">{{ password.notes }}</span>
            </div>
          </div>
          
          <div class="card-footer">
            <span class="updated-at">
              更新于: {{ new Date(password.updatedAt).toLocaleString() }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.password-manager {
  padding: var(--content-padding);
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.tool-header {
  margin-bottom: var(--spacing-lg);
}

.tool-header h2 {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--text-primary);
}

.tool-header p {
  margin: 0 0 var(--spacing-lg) 0;
  color: var(--text-secondary);
}

.tool-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-md);
}

.search-box {
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--button-border-radius);
  border: 1px solid var(--bg-tertiary);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

/* 表单样式 */
.password-form {
  background-color: var(--bg-secondary);
  border-radius: var(--card-border-radius);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.password-form h3 {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  color: var(--text-secondary);
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--button-border-radius);
  border: 1px solid var(--bg-tertiary);
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.password-field {
  position: relative;
}

.generate-btn {
  position: absolute;
  right: 8px;
  top: 32px;
  background: none;
  border: none;
  color: var(--text-secondary);
}

/* 密码列表样式 */
.password-list {
  flex: 1;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl) 0;
  color: var(--text-tertiary);
}

.empty-state p {
  margin-bottom: var(--spacing-md);
}

.password-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

.password-card {
  background-color: var(--bg-secondary);
  border-radius: var(--card-border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.password-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.card-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--bg-tertiary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.card-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.card-body {
  padding: var(--spacing-md);
}

.card-footer {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--bg-tertiary);
  font-size: 12px;
  color: var(--text-tertiary);
}

.password-field {
  margin-bottom: var(--spacing-sm);
  position: relative;
}

.password-field.notes {
  margin-top: var(--spacing-md);
}

.field-label {
  font-weight: 500;
  color: var(--text-secondary);
  margin-right: var(--spacing-xs);
  display: block;
  font-size: 12px;
}

.field-value {
  color: var(--text-primary);
  word-break: break-all;
}

.website-link {
  color: var(--primary-color);
  text-decoration: none;
}

.website-link:hover {
  text-decoration: underline;
}

.btn-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background-color: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.btn-icon:hover {
  background-color: var(--bg-tertiary);
  color: var(--primary-color);
}

.copy-btn,
.toggle-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.copy-btn {
  right: 24px;
}

.updated-at {
  font-size: 11px;
}
</style> 