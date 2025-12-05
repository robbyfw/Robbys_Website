// Supabase setup
const SUPABASE_URL = "https://dwivklunuucddhbnzmbl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3aXZrbHVudXVjZGRoYm56bWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NTU4NDEsImV4cCI6MjA3NTIzMTg0MX0.Rj800uYlaO4TtV6TA_ThUoHhhQy55E2A9boADLStuUI";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin credentials
const ADMIN_USERNAME = "fwrobby";
const ADMIN_PASSWORD = "m.asim12";

// State management
let userId = localStorage.getItem("anon_id");
let isAdmin = localStorage.getItem("is_admin") === "true";
let typingTimeout = null;
let isTyping = false;
let onlineUsers = new Set();

// DOM Elements
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const adminBtn = document.getElementById("adminBtn");
const adminPanel = document.getElementById("adminPanel");
const adminModal = document.getElementById("adminModal");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const refreshBtn = document.getElementById("refreshBtn");
const exportBtn = document.getElementById("exportBtn");
const themeToggle = document.getElementById("themeToggle");
const copyIdBtn = document.getElementById("copyIdBtn");
const newIdBtn = document.getElementById("newIdBtn");
const emojiBtn = document.getElementById("emojiBtn");
const emojiModal = document.getElementById("emojiModal");
const typingIndicator = document.getElementById("typingIndicator");
const typingUsers = document.getElementById("typingUsers");
const charCount = document.getElementById("charCount");
const onlineCount = document.getElementById("onlineCount");
const userDisplay = document.getElementById("userDisplay");

// Rate limit
let lastSent = 0;
const RATE_LIMIT_MS = 3000;

// Generate random anonymous ID
function generateAnonymousId() {
  const randomFourDigits = Math.floor(1000 + Math.random() * 9000);
  return `Anonymous#${randomFourDigits}`;
}

// Initialize user ID
if (!userId) {
  userId = generateAnonymousId();
  localStorage.setItem("anon_id", userId);
}
userDisplay.textContent = userId;

// Add user to online users
onlineUsers.add(userId);
updateOnlineCount();

// Format timestamps
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Format date for display
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + formatTime(timestamp);
}

// Display message with enhanced features
function displayMessage(msg, isHistory = false) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.dataset.messageId = msg.id;
  
  // Check if message is deleted
  if (msg.deleted) {
    div.classList.add("deleted");
  }

  // Avatar with color based on user ID
  const avatar = document.createElement("div");
  avatar.classList.add("avatar");
  
  // Generate consistent color from user ID
  const colors = ['#7289da', '#43b581', '#faa61a', '#f57731', '#593695'];
  const hash = msg.user_id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const color = colors[hash % colors.length];
  avatar.style.backgroundColor = color;
  
  // Add first letter to avatar
  const firstLetter = msg.user_id.charAt(0).toUpperCase();
  avatar.textContent = firstLetter;

  // Display name
  let displayName;
  if (msg.user_id === userId) {
    displayName = "You";
    div.classList.add("you");
  } else {
    displayName = msg.user_id;
  }

  // Message content
  const contentDiv = document.createElement("div");
  contentDiv.classList.add("message-content");

  const headerDiv = document.createElement("div");
  headerDiv.classList.add("message-header");
  
  const nameSpan = document.createElement("strong");
  nameSpan.textContent = displayName;
  
  const timestampSpan = document.createElement("span");
  timestampSpan.classList.add("timestamp");
  timestampSpan.textContent = formatDate(msg.created_at);
  
  headerDiv.appendChild(nameSpan);
  headerDiv.appendChild(timestampSpan);

  // Add delete button for admin or own messages
  if ((isAdmin || msg.user_id === userId) && !msg.deleted) {
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = "Delete message";
    deleteBtn.onclick = () => deleteMessage(msg.id);
    headerDiv.appendChild(deleteBtn);
  }

  const textDiv = document.createElement("div");
  textDiv.classList.add("message-text");
  
  // Process message content for emojis and links
  textDiv.innerHTML = processMessageContent(msg.content);

  contentDiv.appendChild(headerDiv);
  contentDiv.appendChild(textDiv);

  div.appendChild(avatar);
  div.appendChild(contentDiv);

  if (isHistory) {
    messagesDiv.appendChild(div);
  } else {
    // Add new message at the end with animation
    messagesDiv.appendChild(div);
    div.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }
  
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Process message content for emojis, links, and formatting
function processMessageContent(content) {
  if (!content) return '';
  
  let processed = content;
  
  // Convert URLs to clickable links
  processed = processed.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" class="message-link">$1</a>'
  );
  
  // Convert emoji shortcodes (optional)
  const emojiMap = {
    ':smile:': '😊',
    ':heart:': '❤️',
    ':thumbsup:': '👍',
    ':fire:': '🔥',
    ':eyes:': '👀'
  };
  
  Object.entries(emojiMap).forEach(([shortcode, emoji]) => {
    processed = processed.replace(new RegExp(shortcode, 'g'), emoji);
  });
  
  // Basic markdown-like formatting
  processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
  processed = processed.replace(/`(.*?)`/g, '<code>$1</code>');
  
  return processed;
}

// Load messages with pagination
async function loadMessages() {
  const { data, error } = await supabaseClient
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    console.error("Error loading messages:", error);
    return;
  }
  
  // Clear messages except welcome
  const welcome = document.querySelector('.welcome-message');
  messagesDiv.innerHTML = '';
  if (welcome) messagesDiv.appendChild(welcome);
  
  // Display all messages
  data.forEach(msg => displayMessage(msg, true));
  
  // Update message count in admin panel
  document.getElementById('messageCount').textContent = data.length;
}

// Send message with typing indicator
async function sendMessage() {
  const now = Date.now();
  const content = messageInput.value.trim();
  
  if (!content) return;

  // Rate limiting
  if (now - lastSent < RATE_LIMIT_MS) {
    showNotification("Please wait 3 seconds between messages", "warning");
    return;
  }
  
  if (content.length > 500) {
    showNotification("Message too long (max 500 characters)", "warning");
    return;
  }

  lastSent = now;

  // Send typing stopped
  sendTypingStopped();

  const { error } = await supabaseClient
    .from("messages")
    .insert([{ 
      user_id: userId, 
      content: content,
      created_at: new Date().toISOString()
    }]);

  if (error) {
    console.error("Error sending message:", error);
    showNotification("Failed to send message", "error");
    return;
  }
  
  messageInput.value = "";
  charCount.textContent = "0";
}

// Delete message (admin or own)
async function deleteMessage(messageId) {
  if (!confirm("Are you sure you want to delete this message?")) return;

  if (isAdmin) {
    // Admin can permanently delete
    const { error } = await supabaseClient
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      console.error("Error deleting message:", error);
      showNotification("Failed to delete message", "error");
      return;
    }
    
    showNotification("Message deleted", "success");
  } else {
    // Regular users can only soft delete
    const { error } = await supabaseClient
      .from("messages")
      .update({ deleted: true })
      .eq("id", messageId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting message:", error);
      showNotification("Failed to delete message", "error");
      return;
    }
    
    showNotification("Message deleted", "success");
  }
}

// Clear all messages (admin only)
async function clearAllMessages() {
  if (!isAdmin) {
    showNotification("Admin access required", "error");
    return;
  }

  if (!confirm("⚠️ DANGER: This will delete ALL messages permanently! Continue?")) return;

  const { error } = await supabaseClient
    .from("messages")
    .delete()
    .neq("id", 0); // Delete all messages

  if (error) {
    console.error("Error clearing messages:", error);
    showNotification("Failed to clear messages", "error");
    return;
  }

  showNotification("All messages cleared", "success");
  loadMessages();
}

// Export chat history
async function exportChat() {
  const { data, error } = await supabaseClient
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error exporting chat:", error);
    return;
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    totalMessages: data.length,
    messages: data.map(msg => ({
      id: msg.id,
      user: msg.user_id,
      content: msg.content,
      timestamp: msg.created_at,
      deleted: msg.deleted || false
    }))
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification("Chat exported successfully", "success");
}

// Admin login
function adminLogin(username, password) {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    isAdmin = true;
    localStorage.setItem("is_admin", "true");
    adminModal.style.display = "none";
    adminPanel.classList.remove("hidden");
    showNotification("Admin login successful", "success");
    updateAdminPanel();
  } else {
    document.getElementById("loginError").textContent = "Invalid credentials";
    showNotification("Invalid admin credentials", "error");
  }
}

// Admin logout
function adminLogout() {
  isAdmin = false;
  localStorage.removeItem("is_admin");
  adminPanel.classList.add("hidden");
  showNotification("Logged out from admin", "info");
}

// Typing indicator
function sendTypingStarted() {
  if (isTyping) return;
  
  isTyping = true;
  // In a real app, you would send this to a "typing" channel
  // For now, we'll just show it locally
  typingIndicator.classList.remove("hidden");
}

function sendTypingStopped() {
  isTyping = false;
  typingIndicator.classList.add("hidden");
}

// Update online users count
function updateOnlineCount() {
  onlineCount.textContent = onlineUsers.size;
}

// Show notification
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    ${message}
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Generate emoji picker
function generateEmojiPicker() {
  const emojiGrid = document.getElementById("emojiGrid");
  const emojis = ["😊", "😂", "❤️", "😍", "🔥", "👍", "👀", "🎉", "🙏", "🤔", "😎", "🥳", "😢", "🤯", "👏", "💯"];
  
  emojiGrid.innerHTML = emojis.map(emoji => `
    <span onclick="insertEmoji('${emoji}')">${emoji}</span>
  `).join('');
}

// Insert emoji into message input
function insertEmoji(emoji) {
  const input = messageInput;
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const text = input.value;
  
  input.value = text.substring(0, start) + emoji + text.substring(end);
  input.focus();
  input.selectionStart = input.selectionEnd = start + emoji.length;
  
  emojiModal.style.display = "none";
}

// Update character count
function updateCharCount() {
  const length = messageInput.value.length;
  charCount.textContent = length;
  
  if (length > 450) {
    charCount.style.color = "var(--warning-color)";
  } else if (length > 490) {
    charCount.style.color = "var(--danger-color)";
  } else {
    charCount.style.color = "var(--text-muted)";
  }
}

// Initialize admin panel
function updateAdminPanel() {
  if (isAdmin) {
    adminBtn.innerHTML = '<i class="fas fa-crown"></i>';
    adminBtn.title = "Admin Mode Active";
    adminBtn.style.color = "var(--warning-color)";
  } else {
    adminBtn.innerHTML = '<i class="fas fa-shield-alt"></i>';
    adminBtn.title = "Admin Panel";
    adminBtn.style.color = "";
  }
}

// Event Listeners
sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

messageInput.addEventListener("input", () => {
  updateCharCount();
  
  // Typing indicator
  clearTimeout(typingTimeout);
  sendTypingStarted();
  
  typingTimeout = setTimeout(() => {
    sendTypingStopped();
  }, 1000);
});

adminBtn.addEventListener("click", () => {
  if (isAdmin) {
    adminPanel.classList.toggle("hidden");
  } else {
    adminModal.style.display = "block";
  }
});

loginBtn.addEventListener("click", () => {
  const username = document.getElementById("adminUsername").value;
  const password = document.getElementById("adminPassword").value;
  adminLogin(username, password);
});

logoutBtn.addEventListener("click", adminLogout);
clearAllBtn.addEventListener("click", clearAllMessages);
refreshBtn.addEventListener("click", loadMessages);
exportBtn.addEventListener("click", exportChat);

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  const icon = themeToggle.querySelector("i");
  icon.classList.toggle("fa-moon");
  icon.classList.toggle("fa-sun");
});

copyIdBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(userId);
  showNotification("User ID copied to clipboard", "success");
});

newIdBtn.addEventListener("click", () => {
  if (confirm("Generate a new anonymous ID? This will reset your identity.")) {
    userId = generateAnonymousId();
    localStorage.setItem("anon_id", userId);
    userDisplay.textContent = userId;
    showNotification("New ID generated: " + userId, "success");
  }
});

emojiBtn.addEventListener("click", () => {
  emojiModal.style.display = "block";
  generateEmojiPicker();
});

// Close modals when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === adminModal) {
    adminModal.style.display = "none";
  }
  if (e.target === emojiModal) {
    emojiModal.style.display = "none";
  }
});

// Close modals with X button
document.querySelectorAll(".close-modal").forEach(btn => {
  btn.addEventListener("click", () => {
    adminModal.style.display = "none";
    emojiModal.style.display = "none";
  });
});

// Realtime listeners
supabaseClient
  .channel("public:messages")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "messages" },
    (payload) => displayMessage(payload.new)
  )
  .on(
    "postgres_changes",
    { event: "DELETE", schema: "public", table: "messages" },
    (payload) => {
      const messageDiv = document.querySelector(`[data-message-id="${payload.old.id}"]`);
      if (messageDiv) {
        messageDiv.classList.add("deleted");
        const textDiv = messageDiv.querySelector(".message-text");
        if (textDiv) {
          textDiv.textContent = "[Message deleted]";
          textDiv.style.textDecoration = "line-through";
        }
      }
    }
  )
  .subscribe();

// Load initial messages and update admin panel
loadMessages();
updateAdminPanel();

// Add notification styles
const style = document.createElement('style');
style.textContent = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: #202225;
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    transition: opacity 0.3s;
  }
  
  .notification.success {
    border-left: 4px solid var(--success-color);
  }
  
  .notification.error {
    border-left: 4px solid var(--danger-color);
  }
  
  .notification.warning {
    border-left: 4px solid var(--warning-color);
  }
  
  .notification.info {
    border-left: 4px solid var(--primary-color);
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

// Add CSS for message links
const linkStyle = document.createElement('style');
linkStyle.textContent = `
  .message-link {
    color: #00b0f4;
    text-decoration: none;
    word-break: break-all;
  }
  
  .message-link:hover {
    text-decoration: underline;
  }
`;
document.head.appendChild(linkStyle);