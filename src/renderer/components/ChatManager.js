// extracted from original renderer.js
// TODO: replace with persistent chat history
const messages = [];
let typingIndicator = null;

function addMessage(content, type = "assistant", system = "CORE") {
  const messagesContainer = document.getElementById("messagesContainer");
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const message = { id: Date.now(), content, type, system, timestamp };
  messages.push(message);
  renderMessage(message);
  scrollToBottom();
}

function renderMessage(message) {
  const messagesContainer = document.getElementById("messagesContainer");
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
  const messagesContainer = document.getElementById("messagesContainer");
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
  const messagesContainer = document.getElementById("messagesContainer");
  if (typingIndicator) {
    messagesContainer.removeChild(typingIndicator);
    typingIndicator = null;
  }
}

function scrollToBottom() {
  const messagesContainer = document.getElementById("messagesContainer");
  setTimeout(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 50);
}

function clearMessages() {
  const messagesContainer = document.getElementById("messagesContainer");
  messages.length = 0;
  messagesContainer.innerHTML = "";
}

export { addMessage, showTypingIndicator, hideTypingIndicator, clearMessages, scrollToBottom };
