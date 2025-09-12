const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");

// Load saved chat
window.onload = () => loadMessages();

// Save messages
function saveMessages() {
  localStorage.setItem("messages", chatBox.innerHTML);
}

// Load messages
function loadMessages() {
  const saved = localStorage.getItem("messages");
  if (saved) {
    chatBox.innerHTML = saved;
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

// Send message
function sendMessage() {
  const text = messageInput.value.trim();
  if (text === "") return;

  // Random anonymous style
  const randomClass = "msg" + (Math.floor(Math.random() * 4) + 1);

  const msg = document.createElement("div");
  msg.className = `chat-message ${randomClass}`;
  msg.textContent = text;

  chatBox.appendChild(msg);
  messageInput.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;

  saveMessages();
}

// Enter key
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Button click
sendBtn.addEventListener("click", sendMessage);

// Clear chat
function clearChat() {
  chatBox.innerHTML = "";
  localStorage.removeItem("messages");
}
