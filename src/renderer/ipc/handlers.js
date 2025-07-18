// extracted from renderer.js IPC listeners
// TODO: add more IPC events as needed
function registerIPCHandlers(jarvisContainer) {
  window.electronAPI.on('click-through-changed', (_event, isActive) => {
    if (isActive) {
      jarvisContainer.classList.add('click-through');
    } else {
      jarvisContainer.classList.remove('click-through');
    }
  });

  window.electronAPI.on('window-blur', () => {
    jarvisContainer.classList.add('window-blur');
  });

  window.electronAPI.on('window-focus', () => {
    jarvisContainer.classList.remove('window-blur');
  });
}

export { registerIPCHandlers };
