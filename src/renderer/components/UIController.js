// extracted from original index.html and renderer.js
// NOTE: handles DOM creation and events
import {
  addMessage,
  showTypingIndicator,
  hideTypingIndicator,
} from "../components/ChatManager.js";
import {
  initThreeJS,
  cleanupThreeJS,
  triggerProcessingEffect,
  setScene,
} from "../three/scene.js";
import { getMockAgentResponse, processUserInput } from "../utils/helpers.js";

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
let currentColorTheme = "classic";
let currentScene = "hologram";

// Clear any conflicting localStorage on startup
function clearConflictingStorage() {
  try {
    // Clear any existing JARVIS-related localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.includes("jarvis") ||
          key.includes("color") ||
          key.includes("scene"))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    console.log("Cleared conflicting localStorage keys:", keysToRemove);
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
}

function setupDOM() {
  document.getElementById("app").innerHTML = template;
}

function selectColorTheme(theme) {
  console.log("selectColorTheme called with:", theme);
  currentColorTheme = theme;
  const jarvisContainer = document.querySelector(".jarvis-container");

  if (!jarvisContainer) {
    console.error("jarvisContainer not found!");
    return;
  }

  // Remove all theme classes
  jarvisContainer.className = jarvisContainer.className.replace(
    /theme-\w+/g,
    ""
  );
  jarvisContainer.classList.add(`theme-${theme}`);

  // Update active state
  document
    .querySelectorAll("#colorDropdown .selector-option")
    .forEach((option) => {
      option.classList.remove("active");
    });
  const activeOption = document.querySelector(`[data-color="${theme}"]`);
  if (activeOption) {
    activeOption.classList.add("active");
  }

  const colorDropdown = document.getElementById("colorDropdown");
  if (colorDropdown) {
    colorDropdown.classList.remove("active");
  }

  console.log("Color theme applied:", theme);
}

function selectScene(sceneName) {
  console.log("selectScene called with:", sceneName);
  currentScene = sceneName;

  try {
    setScene(sceneName);
    console.log("setScene called successfully for:", sceneName);
  } catch (error) {
    console.error("Error calling setScene:", error);
  }

  // Update active state
  document
    .querySelectorAll("#sceneDropdown .selector-option")
    .forEach((option) => {
      option.classList.remove("active");
    });
  const activeOption = document.querySelector(`[data-scene="${sceneName}"]`);
  if (activeOption) {
    activeOption.classList.add("active");
    console.log("Active scene option updated");
  } else {
    console.error("Could not find scene option for:", sceneName);
  }

  const sceneDropdown = document.getElementById("sceneDropdown");
  if (sceneDropdown) {
    sceneDropdown.classList.remove("active");
  }

  console.log("Scene selection completed for:", sceneName);
}

async function handleUserInput() {
  const userInput = document.getElementById("userInput");
  const jarvisContainer = document.querySelector(".jarvis-container");

  const input = userInput.value.trim();
  if (!input || isProcessing) return;

  addMessage(input, "user");
  commandHistory.unshift(input);
  if (commandHistory.length > 50) commandHistory.pop();
  historyIndex = -1;
  userInput.value = "";
  isProcessing = true;
  jarvisContainer.classList.add("processing");
  showTypingIndicator();
  triggerProcessingEffect();

  try {
    const response = await processUserInput(input);
    hideTypingIndicator();
    addMessage(response.response, "assistant", response.system);
    jarvisContainer.classList.remove("processing");
  } catch (err) {
    console.error(err);
  } finally {
    isProcessing = false;
  }
}
function bindUI() {
  console.log("bindUI called");

  // Get elements fresh each time
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const minimizeBtn = document.getElementById("minimizeBtn");
  const closeBtn = document.getElementById("closeBtn");
  const colorToggle = document.getElementById("colorToggle");
  const colorDropdown = document.getElementById("colorDropdown");
  const sceneToggle = document.getElementById("sceneToggle");
  const sceneDropdown = document.getElementById("sceneDropdown");

  if (!userInput || !sendBtn || !colorToggle || !sceneToggle) {
    console.error("Some UI elements not found during binding!");
    return;
  }

  // Input handlers
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserInput();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        userInput.value = commandHistory[historyIndex];
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        userInput.value = commandHistory[historyIndex];
      } else if (historyIndex === 0) {
        historyIndex = -1;
        userInput.value = "";
      }
    }
  });

  sendBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    handleUserInput();
  });

  // Window controls
  minimizeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    window.electronAPI.send("minimize-app");
  });

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    window.electronAPI.send("close-app");
  });

  // Dropdown toggles
  colorToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    console.log("Color toggle clicked");
    colorDropdown.classList.toggle("active");
    sceneDropdown.classList.remove("active");
  });

  sceneToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    console.log("Scene toggle clicked");
    sceneDropdown.classList.toggle("active");
    colorDropdown.classList.remove("active");
  });

  // Use a more direct approach with proper event delegation
  function bindDropdownOptions() {
    console.log("Binding dropdown options...");

    // Color theme options - bind to each individual option
    const colorOptions = document.querySelectorAll(
      "#colorDropdown .selector-option"
    );
    console.log("Found", colorOptions.length, "color options");

    colorOptions.forEach((option, index) => {
      const colorValue = option.dataset.color;
      console.log(`Binding color option ${index}: ${colorValue}`);

      // Remove any existing listeners first
      option.removeEventListener("click", handleColorClick);
      option.removeEventListener("mousedown", handleColorClick);

      // Add both click and mousedown for better compatibility
      option.addEventListener("click", handleColorClick);
      option.addEventListener("mousedown", handleColorClick);

      function handleColorClick(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Color option clicked:", colorValue);
        selectColorTheme(colorValue);
      }
    });

    // Scene options - bind to each individual option
    const sceneOptions = document.querySelectorAll(
      "#sceneDropdown .selector-option"
    );
    console.log("Found", sceneOptions.length, "scene options");

    sceneOptions.forEach((option, index) => {
      const sceneValue = option.dataset.scene;
      console.log(`Binding scene option ${index}: ${sceneValue}`);

      // Remove any existing listeners first
      option.removeEventListener("click", handleSceneClick);
      option.removeEventListener("mousedown", handleSceneClick);

      // Add both click and mousedown for better compatibility
      option.addEventListener("click", handleSceneClick);
      option.addEventListener("mousedown", handleSceneClick);

      function handleSceneClick(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Scene option clicked:", sceneValue);
        selectScene(sceneValue);
      }
    });

    console.log("Dropdown options binding completed");
  }

  // Call the binding function immediately
  bindDropdownOptions();

  // Also add a fallback event delegation approach
  document.addEventListener("click", (e) => {
    // Check if click is inside a dropdown option
    const colorOption = e.target.closest("#colorDropdown .selector-option");
    if (colorOption && colorOption.dataset.color) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Fallback: Color option clicked:", colorOption.dataset.color);
      selectColorTheme(colorOption.dataset.color);
      return;
    }

    const sceneOption = e.target.closest("#sceneDropdown .selector-option");
    if (sceneOption && sceneOption.dataset.scene) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Fallback: Scene option clicked:", sceneOption.dataset.scene);
      selectScene(sceneOption.dataset.scene);
      return;
    }

    // Close dropdowns when clicking outside
    if (!e.target.closest(".selector")) {
      colorDropdown.classList.remove("active");
      sceneDropdown.classList.remove("active");
    }
  });

  console.log("UI binding completed");
}
function initialize() {
  console.log("initialize called");

  // Clear any conflicting localStorage first
  clearConflictingStorage();

  setupDOM();

  // Small delay to ensure DOM is ready
  setTimeout(() => {
    bindUI();
    initThreeJS();

    // Focus input
    const userInput = document.getElementById("userInput");
    if (userInput) {
      userInput.focus();
    }

    // Welcome message
    setTimeout(() => {
      addMessage(
        "Good evening, sir. All systems operational. How may I assist you today?",
        "assistant",
        "CORE"
      );
    }, 1500);
  }, 100);

  window.addEventListener("beforeunload", () => {
    cleanupThreeJS();
  });

  console.log("initialize completed");
}

export { initialize };
