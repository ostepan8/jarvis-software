import { initialize } from './components/UIController.js';
import { registerIPCHandlers } from './ipc/handlers.js';
import { setScene } from './three/scene.js';

window.addEventListener('DOMContentLoaded', () => {
  initialize();
  const container = document.querySelector('.jarvis-container');
  if (container) {
    registerIPCHandlers(container);
  }
  window.setScene = setScene;
});
