// 🔧 Supabase credentials
const SUPABASE_URL = "https://dwivklunuucddhbnzmbl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3aXZrbHVudXVjZGRoYm56bWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NTU4NDEsImV4cCI6MjA3NTIzMTg0MX0.Rj800uYlaO4TtV6TA_ThUoHhhQy55E2A9boADLStuUI";

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Generate a random anonymous ID per user
let userId = localStorage.getItem("anon_id") || `Anonymous#${Math.floor(1000 + Math.random()*9000)}`;
localStorage.setItem("anon_id", userId);

const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Rate limit: 1 message every 3 seconds
let lastSent = 0;

// Format timestamps
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2,"0");
  const minutes = date.getMinutes().toString().padStart(2,"0");
  return `${hours}:${minutes}`;
}

// Display a message
function displayMessage(msg) {
  const div = document.createElement("div");
  div.classList.add("message");

  let displayName;
  if (msg.user_id === userId) {
    displayName = "You";
    const randomFourDigits = Math.floor(1000 + Math.random() * 9000);
    userId = `Anonymous#${randomFourDigits}`;
  } else {
    displayName = msg.user_id;
  }

  div.innerHTML = `<strong>${displayName}</strong>: ${msg.content} <span class="timestamp">${formatTime(msg.created_at)}</span>`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Load existing messages
async function loadMessages() {
  const { data, error } = await supabaseClient
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });

  if(error) console.error(error);
  else data.forEach(displayMessage);
}

// Send a message
async function sendMessage() {
  const now = Date.now();
  const content = messageInput.value.trim();
  if(!content) return;

  if(now - lastSent < 3000) {
    alert("Slow down! 1 message every 3 seconds.");
    return;
  }
  lastSent = now;

  const { error } = await supabaseClient
    .from("messages")
    .insert([{ user_id: userId, content }]);

  if(error) console.error(error);
  messageInput.value = "";
}

// Event listeners
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", e => { if(e.key === "Enter") sendMessage(); });

// Realtime listener
supabaseClient
  .channel("public:messages")
  .on("postgres_changes", { event: 'INSERT', schema: 'public', table: 'messages' }, payload => displayMessage(payload.new))
  .subscribe();

loadMessages();

// Sidebar toggle
const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  sidebar.classList.toggle("open");
});