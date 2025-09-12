// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCQ3pQ6fz3Hob-PnFahG4RdwkOxMWmZzr4",
  authDomain: "anonymouschat-eb9fa.firebaseapp.com",
  projectId: "anonymouschat-eb9fa",
  storageBucket: "anonymouschat-eb9fa.firebasestorage.app",
  messagingSenderId: "670450301668",
  appId: "1:670450301668:web:9fd0aeaf1960b33fb2caf1",
  measurementId: "G-3K3YLB4TNG"
};

// Init Firebase + Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM elements
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");

// Send message
async function sendMessage() {
  const text = messageInput.value.trim();
  if (text === "") return;

  await addDoc(collection(db, "messages"), {
    text: text,
    createdAt: serverTimestamp()
  });

  messageInput.value = "";
}

// Enter key
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Button click
sendBtn.addEventListener("click", sendMessage);

// Load messages live
const q = query(collection(db, "messages"), orderBy("createdAt"));
onSnapshot(q, (snapshot) => {
  chatBox.innerHTML = ""; // clear
  snapshot.forEach((doc) => {
    const data = doc.data();
    const msg = document.createElement("div");
    msg.className = "chat-message";
    msg.textContent = `Anonymous: ${data.text}`;
    chatBox.appendChild(msg);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
});
