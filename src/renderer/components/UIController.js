// extracted from original index.html and renderer.js
// NOTE: handles DOM creation and events
import { addMessage, showTypingIndicator, hideTypingIndicator } from '../components/ChatManager.js';
import { initThreeJS, cleanupThreeJS, triggerProcessingEffect, setScene } from '../three/scene.js';
import { getMockAgentResponse, processUserInput } from '../utils/helpers.js';

// HTML template injected into #app
const template = `
<div class="jarvis-container theme-classic">
    <div class="header">
        <div class="status-indicator">
            <div class="jarvis-orb">
                <div class="orb-core"></div>
                <div class="orb-ring ring-1"></div>
                <div class="orb-ring ring-2"></div>
                <div class="orb-ring ring-3"></div>
                <div class="orb-particles">
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                </div>
            </div>
            <span class="status-text">JARVIS ONLINE</span>
        </div>
        <div class="controls">
            <div class="selector">
                <button class="selector-btn" id="colorToggle">COL</button>
                <div class="selector-dropdown" id="colorDropdown">
                    <div class="selector-option active" data-color="classic">
                        <div class="option-preview classic"></div>
                        <span class="option-name">Classic</span>
                    </div>
                    <div class="selector-option" data-color="matrix">
                        <div class="option-preview matrix"></div>
                        <span class="option-name">Matrix</span>
                    </div>
                    <div class="selector-option" data-color="neon">
                        <div class="option-preview neon"></div>
                        <span class="option-name">Neon</span>
                    </div>
                    <div class="selector-option" data-color="fire">
                        <div class="option-preview fire"></div>
                        <span class="option-name">Fire</span>
                    </div>
                    <div class="selector-option" data-color="ocean">
                        <div class="option-preview ocean"></div>
                        <span class="option-name">Ocean</span>
                    </div>
                    <div class="selector-option" data-color="purple">
                        <div class="option-preview purple"></div>
                        <span class="option-name">Purple</span>
                    </div>
                </div>
            </div>
            <div class="selector">
                <button class="selector-btn" id="sceneToggle">3D</button>
                <div class="selector-dropdown" id="sceneDropdown">
                    <div class="selector-option active" data-scene="hologram">
                        <div class="option-preview hologram"></div>
                        <span class="option-name">Hologram</span>
                    </div>
                    <div class="selector-option" data-scene="datacenter">
                        <div class="option-preview datacenter"></div>
                        <span class="option-name">Data Center</span>
                    </div>
                    <div class="selector-option" data-scene="crystal">
                        <div class="option-preview crystal"></div>
                        <span class="option-name">Crystal</span>
                    </div>
                    <div class="selector-option" data-scene="neural">
                        <div class="option-preview neural"></div>
                        <span class="option-name">Neural</span>
                    </div>
                    <div class="selector-option" data-scene="quantum">
                        <div class="option-preview quantum"></div>
                        <span class="option-name">Quantum</span>
                    </div>
                    <div class="selector-option" data-scene="galaxy">
                        <div class="option-preview galaxy"></div>
                        <span class="option-name">Galaxy</span>
                    </div>
                </div>
            </div>
            <button id="minimizeBtn" class="control-btn" title="Minimize">
                <span class="icon">−</span>
            </button>
            <button id="closeBtn" class="control-btn" title="Close">
                <span class="icon">×</span>
            </button>
        </div>
    </div>
    <div class="chat-container">
        <div id="messagesContainer" class="messages-container"></div>
    </div>
    <div class="input-area">
        <div class="input-container">
            <span class="input-prompt">></span>
            <input type="text" id="userInput" class="user-input" placeholder="Enter command..." autocomplete="off" spellcheck="false" />
            <button id="sendBtn" class="send-btn">
                <span class="send-icon">→</span>
            </button>
        </div>
    </div>
    <div id="threejsContainer" class="threejs-container"></div>
    <div class="background-grid"></div>
    <div class="scan-line"></div>
</div>`;

let isProcessing = false;
let commandHistory = [];
let historyIndex = -1;

function setupDOM() {
  document.getElementById('app').innerHTML = template;
}

function getElements() {
  return {
    userInput: document.getElementById('userInput'),
    sendBtn: document.getElementById('sendBtn'),
    jarvisContainer: document.querySelector('.jarvis-container'),
    minimizeBtn: document.getElementById('minimizeBtn'),
    closeBtn: document.getElementById('closeBtn'),
    colorToggle: document.getElementById('colorToggle'),
    colorDropdown: document.getElementById('colorDropdown'),
    colorOptions: document.querySelectorAll('#colorDropdown .selector-option'),
    sceneToggle: document.getElementById('sceneToggle'),
    sceneDropdown: document.getElementById('sceneDropdown'),
    sceneOptions: document.querySelectorAll('#sceneDropdown .selector-option')
  };
}

function applyColorPreference(color, elements) {
  if (!color) return;
  elements.colorOptions.forEach(o => {
    if (o.dataset.color === color) {
      o.classList.add('active');
    } else {
      o.classList.remove('active');
    }
  });
  elements.jarvisContainer.classList.forEach(cls => {
    if (cls.startsWith('theme-')) {
      elements.jarvisContainer.classList.remove(cls);
    }
  });
  elements.jarvisContainer.classList.add(`theme-${color}`);
}

function applyScenePreference(scene, elements) {
  if (!scene) return;
  elements.sceneOptions.forEach(o => {
    if (o.dataset.scene === scene) {
      o.classList.add('active');
    } else {
      o.classList.remove('active');
    }
  });
  setScene(scene);
}

function loadPreferences(elements) {
  const savedColor = localStorage.getItem('jarvis-color');
  const savedScene = localStorage.getItem('jarvis-scene');
  applyColorPreference(savedColor, elements);
  applyScenePreference(savedScene, elements);
}

async function handleUserInput(elements) {
  const input = elements.userInput.value.trim();
  if (!input || isProcessing) return;
  addMessage(input, 'user');
  commandHistory.unshift(input);
  if (commandHistory.length > 50) commandHistory.pop();
  historyIndex = -1;
  elements.userInput.value = '';
  isProcessing = true;
  elements.jarvisContainer.classList.add('processing');
  showTypingIndicator();
  triggerProcessingEffect();
  try {
    const response = await processUserInput(input);
    hideTypingIndicator();
    addMessage(response.response, 'assistant', response.system);
    elements.jarvisContainer.classList.remove('processing');
  } catch (err) {
    console.error(err);
  } finally {
    isProcessing = false;
  }
}

function bindUI() {
  const elements = getElements();
  elements.userInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserInput(elements);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        elements.userInput.value = commandHistory[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        elements.userInput.value = commandHistory[historyIndex];
      } else if (historyIndex === 0) {
        historyIndex = -1;
        elements.userInput.value = '';
      }
    }
  });
  elements.sendBtn.addEventListener('click', e => {
    e.stopPropagation();
    handleUserInput(elements);
  });
  elements.minimizeBtn.addEventListener('click', e => {
    e.stopPropagation();
    window.electronAPI.send('minimize-app');
  });
  elements.closeBtn.addEventListener('click', e => {
    e.stopPropagation();
    window.electronAPI.send('close-app');
  });

  elements.colorToggle.addEventListener('click', e => {
    e.stopPropagation();
    elements.colorDropdown.classList.toggle('active');
    elements.sceneDropdown.classList.remove('active');
  });

  elements.sceneToggle.addEventListener('click', e => {
    e.stopPropagation();
    elements.sceneDropdown.classList.toggle('active');
    elements.colorDropdown.classList.remove('active');
  });

  elements.colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      const color = option.dataset.color;
      applyColorPreference(color, elements);
      localStorage.setItem('jarvis-color', color);
      elements.colorDropdown.classList.remove('active');
    });
  });

  elements.sceneOptions.forEach(option => {
    option.addEventListener('click', () => {
      const scene = option.dataset.scene;
      applyScenePreference(scene, elements);
      localStorage.setItem('jarvis-scene', scene);
      elements.sceneDropdown.classList.remove('active');
    });
  });

  document.addEventListener('click', () => {
    elements.colorDropdown.classList.remove('active');
    elements.sceneDropdown.classList.remove('active');
  });
}

function initialize() {
  setupDOM();
  bindUI();
  initThreeJS();
  const elements = getElements();
  loadPreferences(elements);
  document.getElementById('userInput').focus();
  // Welcome message
  setTimeout(() => {
    addMessage('Good evening, sir. All systems operational. How may I assist you today?', 'assistant', 'CORE');
  }, 1500);
  window.addEventListener('beforeunload', () => {
    cleanupThreeJS();
  });
}

export { initialize };
