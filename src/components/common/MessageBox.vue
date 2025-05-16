<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

// 定义组件属性
const props = defineProps({
  // 提示类型: info, warn, error
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'warn', 'error'].includes(value)
  },
  // 提示标题
  title: {
    type: String,
    default: ''
  },
  // 提示内容
  message: {
    type: String,
    required: true
  },
  // 是否自动关闭
  autoClose: {
    type: Boolean,
    default: true
  },
  // 自动关闭延时(毫秒)
  duration: {
    type: Number,
    default: 4000
  },
  // 是否显示关闭按钮
  showClose: {
    type: Boolean,
    default: true
  },
  // 宽度
  width: {
    type: String,
    default: '360px'
  },
  // z-index
  zIndex: {
    type: Number,
    default: 1000
  }
});

// 事件
const emit = defineEmits(['close', 'copied']);

// 显示状态
const visible = ref(true);
// 复制状态
const copied = ref(false);
// 自动关闭计时器
let timer = null;

// 提示图标
const iconMap = {
  info: 'info-circle',
  warn: 'warning',
  error: 'error'
};

// 提示框标题
const boxTitle = computed(() => {
  if (props.title) return props.title;
  
  const titleMap = {
    info: '提示信息',
    warn: '警告信息',
    error: '错误信息'
  };
  
  return titleMap[props.type];
});

// 关闭提示框
const close = () => {
  visible.value = false;
  emit('close');
};

// 复制内容
const copyMessage = () => {
  navigator.clipboard.writeText(props.message)
    .then(() => {
      copied.value = true;
      emit('copied', props.message);
      
      // 2秒后重置复制状态
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    })
    .catch(err => {
      console.error('复制失败:', err);
    });
};

// 是否显示复制按钮
const showCopy = computed(() => {
  return props.type === 'warn' || props.type === 'error';
});

// 生命周期钩子
onMounted(() => {
  if (props.autoClose && props.duration > 0) {
    timer = setTimeout(() => {
      close();
    }, props.duration);
  }
});

onBeforeUnmount(() => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
});
</script>

<template>
  <transition name="message-fade">
    <div 
      v-if="visible" 
      class="message-box" 
      :class="`message-box--${type}`"
      :style="{ 
        width: width,
        zIndex: zIndex
      }"
    >
      <div class="message-box__header">
        <div class="message-box__icon">
          <!-- 信息图标 -->
          <svg v-if="type === 'info'" class="icon" viewBox="0 0 24 24" width="20" height="20">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          
          <!-- 警告图标 -->
          <svg v-else-if="type === 'warn'" class="icon" viewBox="0 0 24 24" width="20" height="20">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          
          <!-- 错误图标 -->
          <svg v-else-if="type === 'error'" class="icon" viewBox="0 0 24 24" width="20" height="20">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <div class="message-box__title">{{ boxTitle }}</div>
        
        <button v-if="showClose" class="message-box__close" @click="close">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      
      <div class="message-box__content">
        <div class="message-box__message">{{ message }}</div>
        
        <div v-if="showCopy" class="message-box__actions">
          <button 
            class="message-box__copy-btn" 
            @click="copyMessage"
            :class="{ 'copied': copied }"
          >
            <svg v-if="!copied" viewBox="0 0 24 24" width="14" height="14">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <svg v-else viewBox="0 0 24 24" width="14" height="14">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            {{ copied ? '已复制' : '复制' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.message-box {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--bg-secondary, #ffffff);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transition: all 0.3s;
  max-width: 90%;
  border-left: 3px solid transparent;
}

.message-box--info {
  border-left-color: var(--primary-color, #2b73ff);
}

.message-box--warn {
  border-left-color: var(--warning-color, #ff9800);
}

.message-box--error {
  border-left-color: var(--danger-color, #f44336);
}

.message-box__header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.message-box__icon {
  margin-right: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-box--info .message-box__icon {
  color: var(--primary-color, #2b73ff);
}

.message-box--warn .message-box__icon {
  color: var(--warning-color, #ff9800);
}

.message-box--error .message-box__icon {
  color: var(--danger-color, #f44336);
}

.message-box__title {
  font-weight: 600;
  flex: 1;
  font-size: 15px;
  color: var(--text-primary, #333333);
}

.message-box__close {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-tertiary, #999999);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.message-box__close:hover {
  color: var(--text-primary, #333333);
}

.message-box__content {
  padding: 16px;
}

.message-box__message {
  line-height: 1.5;
  color: var(--text-secondary, #666666);
  margin-bottom: 12px;
  word-break: break-word;
  white-space: pre-wrap;
}

.message-box__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.message-box__copy-btn {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  background-color: transparent;
  color: var(--text-tertiary, #666666);
  border: 1px solid var(--bg-tertiary, #dedede);
  transition: all 0.2s;
}

.message-box__copy-btn svg {
  margin-right: 4px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}

.message-box__copy-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-primary, #333333);
}

.message-box__copy-btn.copied {
  background-color: var(--success-color, #4caf50);
  color: white;
  border-color: var(--success-color, #4caf50);
}

.icon {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}

.message-box--info .icon circle {
  fill: var(--primary-color, #2b73ff);
  stroke: none;
}

.message-box--info .icon line {
  stroke: white;
}

.message-box--warn .icon path {
  fill: var(--warning-color, #ff9800);
  stroke: none;
}

.message-box--warn .icon line {
  stroke: white;
}

.message-box--error .icon circle {
  fill: var(--danger-color, #f44336);
  stroke: none;
}

.message-box--error .icon line {
  stroke: white;
}

/* 过渡动画 */
.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.3s ease;
}

.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style> 