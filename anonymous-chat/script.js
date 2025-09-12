// Firebase SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// Firebase config (replace with yours if needed)
const firebaseConfig = {
  apiKey: "AIzaSyCQ3pQ6fz3Hob-PnFahG4RdwkOxMWmZzr4",
  authDomain: "anonymouschat-eb9fa.firebaseapp.com",
  databaseURL: "https://anonymouschat-eb9fa-default-rtdb.firebaseio.com",
  projectId: "anonymouschat-eb9fa",
  storageBucket: "anonymouschat-eb9fa.firebasestorage.app",
  messagingSenderId: "670450301668",
  appId: "1:670450301668:web:9fd0aeaf1960b33fb2caf1",
  measurementId: "G-3K3YLB4TNG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM elements
const chatBox = document.getElementById("chat");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Reference to messages node
const messagesRef = ref(db, "messages");

// Load messages in real time
onValue(messagesRef, (snapshot) => {
  chatBox.innerHTML = ""; // clear existing messages
  snapshot.forEach((child) => {
    const data = child.val();
    const msg = document.createElement("div");
    msg.className = "message";
    msg.innerHTML = `<strong>Anonymous:</strong> ${data.text}`;
    chatBox.appendChild(msg);
  });
  chatBox.scrollTop = chatBox.scrollHeight; // auto scroll
});

// Send message function
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  push(messagesRef, {
    text: text,
    timestamp: Date.now()
  });

  input.value = "";
}

// Send button click
sendBtn.addEventListener("click", sendMessage);

// Enter key press
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
