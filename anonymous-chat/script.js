import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const messagesRef = collection(window.db, "messages");

// Load messages in real time
const q = query(messagesRef, orderBy("timestamp", "asc"));
onSnapshot(q, (snapshot) => {
  messagesDiv.innerHTML = ""; // clear before reloading
  snapshot.forEach((doc) => {
    const data = doc.data();
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message");
    msgDiv.textContent = data.text || "";
    messagesDiv.appendChild(msgDiv);
  });
  // Auto-scroll to bottom
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Send message
sendBtn.addEventListener("click", async () => {
  const text = messageInput.value.trim();
  if (text) {
    await addDoc(messagesRef, {
      text: text,
      timestamp: serverTimestamp()
    });
    messageInput.value = "";
  }
});

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});
