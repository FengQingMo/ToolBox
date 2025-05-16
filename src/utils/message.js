import { createVNode, render } from 'vue';
import MessageBox from '../components/common/MessageBox.vue';

let messageInstance = null;
let container = null;

// 创建容器
const createContainer = () => {
  container = document.createElement('div');
  container.className = 'message-container';
  document.body.appendChild(container);
  return container;
};

// 创建消息
const createMessage = (options) => {
  if (messageInstance) {
    // 移除现有消息
    render(null, container);
    messageInstance = null;
  }
  
  // 确保容器存在
  if (!container) {
    container = createContainer();
  }
  
  // 创建VNode
  const vnode = createVNode(MessageBox, {
    ...options,
    onClose: () => {
      render(null, container);
      messageInstance = null;
      if (options.onClose) options.onClose();
    },
    onCopied: (text) => {
      if (options.onCopied) options.onCopied(text);
    }
  });
  
  // 渲染消息
  render(vnode, container);
  messageInstance = vnode;
  
  return {
    close: () => {
      if (messageInstance?.component?.exposed?.close) {
        messageInstance.component.exposed.close();
      }
    }
  };
};

// 导出消息服务
const MessageService = {
  // 信息提示
  info(message, options = {}) {
    return createMessage({
      type: 'info',
      message,
      ...options
    });
  },
  
  // 警告提示
  warn(message, options = {}) {
    return createMessage({
      type: 'warn',
      message,
      ...options
    });
  },
  
  // 错误提示
  error(message, options = {}) {
    return createMessage({
      type: 'error',
      message,
      autoClose: false,
      ...options
    });
  }
};

export default MessageService; 