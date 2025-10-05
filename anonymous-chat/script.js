// ⬇️ Replace these with your own Supabase credentials
const SUPABASE_URL = "https://mgnuzycygfxwczyziecy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nbnV6eWN5Z2Z4d2N6eXppZWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NTM4ODAsImV4cCI6MjA3NTIyOTg4MH0.z30gZGiXm7gmUMDXnupkMt16txfhCVDPYGTG2my0QCU";

// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Generate anonymous ID once per user
const userId = localStorage.getItem("anon_id") || "anon_" + Math.random().toString(36).substring(2, 10);
localStorage.setItem("anon_id", userId);

const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Function to display messages
function displayMessage(msg) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.textContent = `${msg.user_id}: ${msg.content}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Load past messages
async function loadMessages() {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) console.error(error);
  else data.forEach(displayMessage);
}

// Send new message
async function sendMessage() {
  const content = messageInput.value.trim();
  if (!content) return;

  const { error } = await supabase
    .from("messages")
    .insert([{ user_id: userId, content }]);
  if (error) console.error(error);

  messageInput.value = "";
}

// Listen for send button click
sendBtn.addEventListener("click", sendMessage);

// Send with Enter key
messageInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

// Realtime listener for new messages
supabase
  .channel("public:messages")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "messages" },
    (payload) => {
      displayMessage(payload.new);
    }
  )
  .subscribe();

// Load existing messages at startup
loadMessages();