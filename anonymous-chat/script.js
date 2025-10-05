// Supabase setup
const SUPABASE_URL = "https://dwivklunuucddhbnzmbl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3aXZrbHVudXVjZGRoYm56bWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NTU4NDEsImV4cCI6MjA3NTIzMTg0MX0.Rj800uYlaO4TtV6TA_ThUoHhhQy55E2A9boADLStuUI";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Generate random anonymous ID for each user (only once per device)
let userId = localStorage.getItem("anon_id");
if (!userId) {
  const randomFourDigits = Math.floor(1000 + Math.random() * 9000);
  userId = `Anonymous#${randomFourDigits}`;
  localStorage.setItem("anon_id", userId);
}

const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Rate limit
let lastSent = 0;

// Format timestamps
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Display message
function displayMessage(msg) {
  const div = document.createElement("div");
  div.classList.add("message");

  // Avatar
  const avatar = document.createElement("div");
  avatar.classList.add("avatar");

  // Display name
  let displayName;
  if (msg.user_id === userId) {
    displayName = "You";
  } else {
    // Ensure name always appears as Anonymous#XXXX for others
    if (!msg.user_id.startsWith("Anonymous#")) {
      const randomFourDigits = Math.floor(1000 + Math.random() * 9000);
      displayName = `Anonymous#${randomFourDigits}`;
    } else {
      displayName = msg.user_id;
    }
  }

  // Message content
  const contentDiv = document.createElement("div");
  contentDiv.classList.add("message-content");

  const headerDiv = document.createElement("div");
  headerDiv.classList.add("message-header");
  headerDiv.innerHTML = `<strong>${displayName}</strong> <span class="timestamp">${formatTime(msg.created_at)}</span>`;

  const textDiv = document.createElement("div");
  textDiv.classList.add("message-text");
  textDiv.textContent = msg.content;

  contentDiv.appendChild(headerDiv);
  contentDiv.appendChild(textDiv);

  div.appendChild(avatar);
  div.appendChild(contentDiv);

  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Load messages
async function loadMessages() {
  const { data, error } = await supabaseClient
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) console.error(error);
  else data.forEach(displayMessage);
}

// Send message
async function sendMessage() {
  const now = Date.now();
  const content = messageInput.value.trim();
  if (!content) return;

  if (now - lastSent < 3000) {
    alert("Slow down! 1 message every 3 seconds.");
    return;
  }
  lastSent = now;

  const { error } = await supabaseClient
    .from("messages")
    .insert([{ user_id: userId, content }]);

  if (error) console.error(error);
  messageInput.value = "";
}

// Event listeners
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Realtime listener for new messages
supabaseClient
  .channel("public:messages")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "messages" },
    (payload) => displayMessage(payload.new)
  )
  .subscribe();

// Initial load
loadMessages();