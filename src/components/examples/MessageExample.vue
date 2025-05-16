<script setup>
import { ref } from 'vue';
import MessageService from '../../utils/message.js';

// 消息文本
const infoMessage = ref('这是一条普通提示信息');
const warnMessage = ref('警告！此操作可能导致数据丢失');
const errorMessage = ref('错误：无法连接到服务器，请检查网络连接\n错误代码：ERR_CONNECTION_REFUSED');

// 显示信息提示
const showInfo = () => {
  MessageService.info(infoMessage.value, {
    title: '提示'
  });
};

// 显示警告提示
const showWarning = () => {
  MessageService.warn(warnMessage.value, {
    title: '警告'
  });
};

// 显示错误提示
const showError = () => {
  MessageService.error(errorMessage.value, {
    title: '错误',
    onCopied: (text) => {
      console.log('错误信息已复制:', text);
    }
  });
};

// 显示自定义提示
const showCustom = () => {
  MessageService.info('自定义提示框', {
    title: '自定义',
    width: '400px',
    duration: 10000,
    autoClose: true
  });
};
</script>

<template>
  <div class="message-examples">
    <h2>消息提示框示例</h2>
    
    <div class="example-group">
      <h3>基本用法</h3>
      <div class="buttons">
        <button class="btn btn-primary" @click="showInfo">显示信息提示</button>
        <button class="btn btn-warning" @click="showWarning">显示警告提示</button>
        <button class="btn btn-danger" @click="showError">显示错误提示</button>
        <button class="btn btn-secondary" @click="showCustom">自定义提示</button>
      </div>
    </div>
    
    <div class="example-group">
      <h3>提示文本</h3>
      <div class="form-groups">
        <div class="form-group">
          <label>信息提示文本</label>
          <input type="text" v-model="infoMessage" />
        </div>
        
        <div class="form-group">
          <label>警告提示文本</label>
          <input type="text" v-model="warnMessage" />
        </div>
        
        <div class="form-group">
          <label>错误提示文本</label>
          <textarea v-model="errorMessage" rows="3"></textarea>
        </div>
      </div>
    </div>
    
    <div class="example-group">
      <h3>使用说明</h3>
      <div class="code-block">
        <pre><code>
// 导入消息服务
import MessageService from '@/utils/message.js';

// 显示信息提示
MessageService.info('提示信息');

// 显示警告提示
MessageService.warn('警告信息');

// 显示错误提示
MessageService.error('错误信息');

// 自定义配置
MessageService.info('自定义提示', {
  title: '自定义标题',         // 标题
  autoClose: true,            // 是否自动关闭
  duration: 4000,             // 自动关闭延时(毫秒)
  width: '360px',             // 宽度
  zIndex: 1000,               // 层级
  showClose: true,            // 是否显示关闭按钮
  onClose: () => {},          // 关闭回调
  onCopied: (text) => {}      // 复制回调
});
        </code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-examples {
  padding: 24px;
}

h2 {
  margin-bottom: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

h3 {
  margin-bottom: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.example-group {
  margin-bottom: 32px;
  padding: 24px;
  border-radius: 8px;
  background-color: var(--bg-secondary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.btn-primary {
  background-color: var(--primary-color, #2b73ff);
  color: white;
}

.btn-warning {
  background-color: var(--warning-color, #ff9800);
  color: white;
}

.btn-danger {
  background-color: var(--danger-color, #f44336);
  color: white;
}

.btn-secondary {
  background-color: var(--bg-tertiary, #e0e0e0);
  color: var(--text-primary);
}

.form-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  color: var(--text-secondary);
}

.form-group input,
.form-group textarea {
  padding: 8px 12px;
  border: 1px solid var(--bg-tertiary);
  border-radius: 4px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.code-block {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 16px;
  overflow: auto;
}

.code-block pre {
  margin: 0;
  font-family: monospace;
  color: var(--text-secondary);
  line-height: 1.5;
}
</style> 