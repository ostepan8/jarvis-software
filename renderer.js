// JARVIS Desktop Assistant - Renderer Process
const { ipcRenderer } = require("electron");

// DOM Elements
// DOM Elements
const messagesContainer = document.getElementById("messagesContainer");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const jarvisContainer = document.querySelector(".jarvis-container");
const minimizeBtn = document.getElementById("minimizeBtn");
const closeBtn = document.getElementById("closeBtn");

// Application State
let isProcessing = false;
let isClickThrough = false;
let commandHistory = [];
let historyIndex = -1;
let messages = [];
let typingIndicator = null;

// Three.js variables
let scene, camera, renderer, particles, hologram;
let animationId;

// Three.js variables
let scene, camera, renderer, particles, hologram;
let animationId;

// =============================================================================
// CHAT MESSAGE SYSTEM
// =============================================================================

function addMessage(content, type = "assistant", system = "CORE") {
  console.log("addMessage called with:", { content, type, system });

  if (!messagesContainer) {
    console.error("messagesContainer not found!");
    return;
  }

  const timestamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const message = {
    id: Date.now(),
    content,
    type,
    system,
    timestamp,
  };

  console.log("Created message object:", message);

  messages.push(message);
  renderMessage(message);
  scrollToBottom();

  console.log("Message added to DOM");
}

function renderMessage(message) {
  const messageEl = document.createElement("div");
  messageEl.className = `message ${message.type}`;
  messageEl.dataset.id = message.id;

  const headerEl = document.createElement("div");
  headerEl.className = "message-header";

  const senderEl = document.createElement("span");
  senderEl.className = "message-sender";
  senderEl.textContent = message.type === "user" ? "USER" : message.system;

  const timestampEl = document.createElement("span");
  timestampEl.className = "message-timestamp";
  timestampEl.textContent = message.timestamp;

  headerEl.appendChild(senderEl);
  headerEl.appendChild(timestampEl);

  const contentEl = document.createElement("div");
  contentEl.className = "message-content";
  contentEl.textContent = message.content;

  messageEl.appendChild(headerEl);
  messageEl.appendChild(contentEl);

  messagesContainer.appendChild(messageEl);
}

function showTypingIndicator() {
  if (typingIndicator) return;

  const indicatorEl = document.createElement("div");
  indicatorEl.className = "message assistant";
  indicatorEl.innerHTML = `
        <div class="message-header">
            <span class="message-sender">JARVIS</span>
        </div>
        <div class="typing-indicator">
            <span>Processing</span>
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;

  typingIndicator = indicatorEl;
  messagesContainer.appendChild(indicatorEl);
  scrollToBottom();
}

function hideTypingIndicator() {
  if (typingIndicator) {
    messagesContainer.removeChild(typingIndicator);
    typingIndicator = null;
  }
}

function scrollToBottom() {
  setTimeout(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 50);
}

function clearMessages() {
  messages = [];
  messagesContainer.innerHTML = "";
}

// =============================================================================
// THREE.JS 3D BACKGROUND SYSTEM
// =============================================================================

function initThreeJS() {
  const container = document.getElementById("threejsContainer");

  // Scene setup
  scene = new THREE.Scene();

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0); // Transparent background
  container.appendChild(renderer.domElement);

  // Create particle system for background stars/dots
  createParticleSystem();

  // Create holographic grid
  createHolographicGrid();

  // Create floating geometric shapes
  createFloatingGeometry();

  // Start animation loop
  animate();

  // Handle window resize
  window.addEventListener("resize", onWindowResize);
}

function createParticleSystem() {
  const geometry = new THREE.BufferGeometry();
  const particleCount = 150;

  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    // Random positions
    positions[i] = (Math.random() - 0.5) * 20;
    positions[i + 1] = (Math.random() - 0.5) * 20;
    positions[i + 2] = (Math.random() - 0.5) * 20;

    // JARVIS-style colors (cyan/blue)
    colors[i] = 0.0; // Red
    colors[i + 1] = 0.8; // Green
    colors[i + 2] = 1.0; // Blue
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

function createHolographicGrid() {
  const gridGeometry = new THREE.PlaneGeometry(10, 10, 20, 20);
  const gridMaterial = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.1,
    wireframe: true,
  });

  const grid = new THREE.Mesh(gridGeometry, gridMaterial);
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = -3;
  scene.add(grid);
}

function createFloatingGeometry() {
  // Create a glowing wireframe torus
  const torusGeometry = new THREE.TorusGeometry(1, 0.3, 8, 16);
  const torusMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.3,
    wireframe: true,
  });

  hologram = new THREE.Mesh(torusGeometry, torusMaterial);
  hologram.position.set(2, 0, -2);
  scene.add(hologram);

  // Add a few floating cubes
  for (let i = 0; i < 3; i++) {
    const cubeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const cubeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.4,
      wireframe: true,
    });

    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4
    );
    scene.add(cube);
  }
}

function animate() {
  animationId = requestAnimationFrame(animate);

  // Rotate particles slowly
  if (particles) {
    particles.rotation.y += 0.002;
    particles.rotation.x += 0.001;
  }

  // Animate hologram
  if (hologram) {
    hologram.rotation.x += 0.01;
    hologram.rotation.y += 0.02;
    hologram.position.y = Math.sin(Date.now() * 0.001) * 0.5;
  }

  // Animate camera for subtle movement
  camera.position.x = Math.sin(Date.now() * 0.0005) * 0.5;
  camera.position.y = Math.cos(Date.now() * 0.0003) * 0.3;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Enhanced visual effects for processing state
function triggerProcessingEffect() {
  if (hologram) {
    // Speed up hologram rotation during processing
    hologram.rotation.x += 0.1;
    hologram.rotation.y += 0.1;
  }

  // Add particle burst effect
  if (particles) {
    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += (Math.random() - 0.5) * 0.1;
      positions[i + 1] += (Math.random() - 0.5) * 0.1;
      positions[i + 2] += (Math.random() - 0.5) * 0.1;
    }
    particles.geometry.attributes.position.needsUpdate = true;
  }
}

// Cleanup function
function cleanupThreeJS() {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (renderer) {
    renderer.dispose();
  }
  if (scene) {
    scene.clear();
  }
}

// =============================================================================
// THREE.JS 3D BACKGROUND SYSTEM
// =============================================================================

function initThreeJS() {
  const container = document.getElementById("threejsContainer");

  // Scene setup
  scene = new THREE.Scene();

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0); // Transparent background
  container.appendChild(renderer.domElement);

  // Create particle system for background stars/dots
  createParticleSystem();

  // Create holographic grid
  createHolographicGrid();

  // Create floating geometric shapes
  createFloatingGeometry();

  // Start animation loop
  animate();

  // Handle window resize
  window.addEventListener("resize", onWindowResize);
}

function createParticleSystem() {
  const geometry = new THREE.BufferGeometry();
  const particleCount = 150;

  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    // Random positions
    positions[i] = (Math.random() - 0.5) * 20;
    positions[i + 1] = (Math.random() - 0.5) * 20;
    positions[i + 2] = (Math.random() - 0.5) * 20;

    // JARVIS-style colors (cyan/blue)
    colors[i] = 0.0; // Red
    colors[i + 1] = 0.8; // Green
    colors[i + 2] = 1.0; // Blue
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

function createHolographicGrid() {
  const gridGeometry = new THREE.PlaneGeometry(10, 10, 20, 20);
  const gridMaterial = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.1,
    wireframe: true,
  });

  const grid = new THREE.Mesh(gridGeometry, gridMaterial);
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = -3;
  scene.add(grid);
}

function createFloatingGeometry() {
  // Create a glowing wireframe torus
  const torusGeometry = new THREE.TorusGeometry(1, 0.3, 8, 16);
  const torusMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.3,
    wireframe: true,
  });

  hologram = new THREE.Mesh(torusGeometry, torusMaterial);
  hologram.position.set(2, 0, -2);
  scene.add(hologram);

  // Add a few floating cubes
  for (let i = 0; i < 3; i++) {
    const cubeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const cubeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.4,
      wireframe: true,
    });

    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4
    );
    scene.add(cube);
  }
}

function animate() {
  animationId = requestAnimationFrame(animate);

  // Rotate particles slowly
  if (particles) {
    particles.rotation.y += 0.002;
    particles.rotation.x += 0.001;
  }

  // Animate hologram
  if (hologram) {
    hologram.rotation.x += 0.01;
    hologram.rotation.y += 0.02;
    hologram.position.y = Math.sin(Date.now() * 0.001) * 0.5;
  }

  // Animate camera for subtle movement
  camera.position.x = Math.sin(Date.now() * 0.0005) * 0.5;
  camera.position.y = Math.cos(Date.now() * 0.0003) * 0.3;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Enhanced visual effects for processing state
function triggerProcessingEffect() {
  if (hologram) {
    // Speed up hologram rotation during processing
    hologram.rotation.x += 0.1;
    hologram.rotation.y += 0.1;
  }

  // Add particle burst effect
  if (particles) {
    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += (Math.random() - 0.5) * 0.1;
      positions[i + 1] += (Math.random() - 0.5) * 0.1;
      positions[i + 2] += (Math.random() - 0.5) * 0.1;
    }
    particles.geometry.attributes.position.needsUpdate = true;
  }
}

// Cleanup function
function cleanupThreeJS() {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (renderer) {
    renderer.dispose();
  }
  if (scene) {
    scene.clear();
  }
}

// =============================================================================
// MOCK AGENT SYSTEMS - TODO: Replace with real JARVIS API calls
// =============================================================================

// Mock agent response data
const mockAgentResponses = {
  scheduler: [
    "Reminder set for 2:30 PM.",
    "You have 3 events scheduled today.",
    "Meeting with Sarah moved to 4:00 PM.",
    "Calendar synchronized with external systems.",
  ],
  weather: [
    "72°F and sunny in Boston.",
    "Chance of rain at 40% this afternoon.",
    "Current temperature: 68°F, feels like 71°F.",
    "UV index is moderate. Sunscreen recommended.",
  ],
  home: [
    "Smart lights disabled.",
    "Thermostat set to 72°F.",
    "Security system armed.",
    "All devices synchronized.",
  ],
  system: [
    "All systems operational.",
    "Running diagnostics... Complete.",
    "Network connection stable.",
    "Power levels optimal.",
  ],
  assistant: [
    "How may I assist you today?",
    "Processing your request...",
    "Standing by for further instructions.",
    "Task completed successfully.",
  ],
};

// Mock agent selector based on user input
function selectMockAgent(input) {
  const lowercaseInput = input.toLowerCase();

  if (
    lowercaseInput.includes("remind") ||
    lowercaseInput.includes("schedule") ||
    lowercaseInput.includes("calendar") ||
    lowercaseInput.includes("meeting")
  ) {
    return "scheduler";
  } else if (
    lowercaseInput.includes("weather") ||
    lowercaseInput.includes("temperature") ||
    lowercaseInput.includes("rain") ||
    lowercaseInput.includes("sunny")
  ) {
    return "weather";
  } else if (
    lowercaseInput.includes("light") ||
    lowercaseInput.includes("temperature") ||
    lowercaseInput.includes("home") ||
    lowercaseInput.includes("thermostat")
  ) {
    return "home";
  } else if (
    lowercaseInput.includes("system") ||
    lowercaseInput.includes("status") ||
    lowercaseInput.includes("diagnostic")
  ) {
    return "system";
  } else {
    return "assistant";
  }
}

// Mock agent response generator
function getMockAgentResponse(input) {
  // TODO: Replace with real call to local JARVIS API
  const agentType = selectMockAgent(input);
  const responses = mockAgentResponses[agentType];
  const randomResponse =
    responses[Math.floor(Math.random() * responses.length)];

  return {
    system: agentType.toUpperCase(),
    response: randomResponse,
    timestamp: new Date().toISOString(),
    confidence: Math.random() * 0.3 + 0.7, // Mock confidence score
  };
}

// Simulate async agent processing
async function processUserInput(input) {
  // TODO: Replace with real WebSocket/HTTP call to JARVIS backend
  return new Promise((resolve) => {
    // Simulate network delay
    const delay = Math.random() * 1000 + 500; // 500-1500ms delay
    setTimeout(() => {
      resolve(getMockAgentResponse(input));
    }, delay);
  });
}

// =============================================================================
// UI UPDATE FUNCTIONS
// =============================================================================

function updateChatWithResponse(response) {
  // Hide typing indicator
  hideTypingIndicator();

  // Add assistant message
  addMessage(response.response, "assistant", response.system);

  // Add visual feedback
  jarvisContainer.classList.remove("processing");
}

function clearUserInput() {
  userInput.value = "";
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

// Handle user input submission
async function handleUserInput() {
  const input = userInput.value.trim();

  if (!input || isProcessing) return;

  // Add user message to chat
  addMessage(input, "user");

  // Add to command history
  commandHistory.unshift(input);
  if (commandHistory.length > 50) commandHistory.pop();
  historyIndex = -1;

  // Clear input
  clearUserInput();

  // Set processing state
  isProcessing = true;
  jarvisContainer.classList.add("processing");

  // Show typing indicator
  showTypingIndicator();

  // Trigger 3D visual effects
  triggerProcessingEffect();

  try {
    // Process input through mock agent system
    const response = await processUserInput(input);

    // Update chat with response
    updateChatWithResponse(response);

    // TODO: Add sound effect for response
    // playResponseSound();
  } catch (error) {
    console.error("Error processing input:", error);
    updateChatWithResponse({
      system: "ERROR",
      response: "Unable to process request. Please try again.",
      timestamp: new Date().toISOString(),
    });
  } finally {
    isProcessing = false;
  }
}

// Handle input field events
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

// Send button click handler
sendBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  handleUserInput();
});

// Control button handlers
minimizeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  ipcRenderer.send("minimize-app");
});

closeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  ipcRenderer.send("close-app");
});

// =============================================================================
// IPC COMMUNICATION
// =============================================================================

// Handle click-through state changes
ipcRenderer.on("click-through-changed", (event, isActive) => {
  isClickThrough = isActive;
  if (isActive) {
    jarvisContainer.classList.add("click-through");
  } else {
    jarvisContainer.classList.remove("click-through");
  }
});

// Handle window focus/blur
ipcRenderer.on("window-blur", () => {
  jarvisContainer.classList.add("window-blur");
});

ipcRenderer.on("window-focus", () => {
  jarvisContainer.classList.remove("window-blur");
});

// =============================================================================
// INITIALIZATION
// =============================================================================

// Initialize app on DOM load
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Three.js 3D background
  initThreeJS();

  // Focus input field
  userInput.focus();

  // Add welcome message - with debug logging
  console.log("Adding welcome message...");
  setTimeout(() => {
    console.log("Timeout fired, calling addMessage...");
    try {
      addMessage(
        "Good evening, sir. All systems operational. How may I assist you today?",
        "assistant",
        "CORE"
      );
      console.log("Welcome message added successfully");
    } catch (error) {
      console.error("Error adding welcome message:", error);
    }
  }, 1500);

  // TODO: Initialize WebSocket connection to JARVIS backend
  // initializeJarvisConnection();

  // TODO: Load user preferences and chat history
  // loadUserPreferences();
  // loadChatHistory();

  console.log("🤖 JARVIS Desktop Assistant initialized");
  console.log("💬 Chat interface active");
  console.log("🔮 JARVIS Orb profile active");
  console.log("🎨 Three.js 3D background active");
  console.log("💡 Press Ctrl+J to show/hide window");
  console.log("⚡ All mock systems ready - TODO: Connect to real JARVIS API");
});

// Cleanup on app close
window.addEventListener("beforeunload", () => {
  // TODO: Save chat history
  // saveChatHistory();
  cleanupThreeJS();
});

// =============================================================================
// UTILITY FUNCTIONS (for future expansion)
// =============================================================================

// TODO: Implement real JARVIS API connection
function initializeJarvisConnection() {
  // WebSocket connection to local JARVIS server
  // const ws = new WebSocket('ws://localhost:8080/jarvis');
  // Handle connection, messages, errors
}

// TODO: Implement user preferences
function loadUserPreferences() {
  // Load user settings from local storage or config file
  // Apply theme, positioning, behavior settings
}

// TODO: Implement chat history persistence
function loadChatHistory() {
  // Load previous chat messages from storage
  // const savedMessages = localStorage.getItem('jarvis-chat-history');
  // if (savedMessages) {
  //     messages = JSON.parse(savedMessages);
  //     messages.forEach(msg => renderMessage(msg));
  //     scrollToBottom();
  // }
}

function saveChatHistory() {
  // Save chat history to storage
  // localStorage.setItem('jarvis-chat-history', JSON.stringify(messages));
}

// TODO: Implement sound effects
function playResponseSound() {
  // Play JARVIS-style response sound
  // const audio = document.getElementById('processingSound');
  // audio.play();
}

// TODO: Implement voice input
function initializeVoiceInput() {
  // Set up speech recognition
  // Handle voice commands
}

// Export for testing (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getMockAgentResponse,
    selectMockAgent,
    processUserInput,
    addMessage,
    clearMessages,
  };
}
