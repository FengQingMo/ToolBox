import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

console.log('Initializing application...');

// Create and mount the Vue application
const app = createApp(App)

// Global error handling
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err);
  console.error('Error Info:', info);
};

// Mount the application
app.mount('#app')

// Add Electron bridge to window object if in Electron context
if (window.electron) {
  console.log('Running in Electron environment');
} else {
  console.log('Running in browser environment');
}
