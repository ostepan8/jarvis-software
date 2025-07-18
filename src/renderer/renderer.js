import { initialize } from './components/UIController.js';
import { registerIPCHandlers } from './ipc/handlers.js';

window.addEventListener('DOMContentLoaded', () => {
  initialize();
  const container = document.querySelector('.jarvis-container');
  if (container) {
    registerIPCHandlers(container);
  }
});
