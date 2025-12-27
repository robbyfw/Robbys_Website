// DOM Elements
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messagesContainer');
const typingIndicator = document.getElementById('typingIndicator');
const modelSelect = document.getElementById('modelSelect');
const apiKeyInput = document.getElementById('apiKey');
const temperatureInput = document.getElementById('temperature');
const maxTokensInput = document.getElementById('maxTokens');
const tempValue = document.getElementById('tempValue');
const tokensValue = document.getElementById('tokensValue');
const newChatBtn = document.getElementById('newChatBtn');
const themeToggle = document.getElementById('themeToggle');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const saveSettings = document.getElementById('saveSettings');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.querySelector('.sidebar');
const suggestionBtns = document.querySelectorAll('.suggestion-btn');
const modelInfo = document.getElementById('modelInfo');

// App State
let currentChat = [];
let isLoading = false;

// Initialize from localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

const savedSettings = JSON.parse(localStorage.getItem('chatSettings')) || {
    apiKey: '',
    temperature: 0.7,
    maxTokens: 2048,
    model: 'llama-3.1-70b-versatile'
};

apiKeyInput.value = savedSettings.apiKey || '';
temperatureInput.value = savedSettings.temperature;
maxTokensInput.value = savedSettings.maxTokens;
modelSelect.value = savedSettings.model;

updateModelInfo();

// Event Listeners
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

temperatureInput.addEventListener('input', () => {
    tempValue.textContent = temperatureInput.value;
});

maxTokensInput.addEventListener('input', () => {
    tokensValue.textContent = maxTokensInput.value;
});

newChatBtn.addEventListener('click', startNewChat);
themeToggle.addEventListener('click', toggleTheme);
settingsBtn.addEventListener('click', () => settingsModal.classList.add('active'));
closeSettings.addEventListener('click', () => settingsModal.classList.remove('active'));
saveSettings.addEventListener('click', saveSettingsHandler);
mobileMenuBtn.addEventListener('click', () => sidebar.classList.toggle('active'));
modelSelect.addEventListener('change', updateModelInfo);

suggestionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        messageInput.value = e.target.dataset.prompt;
        messageInput.focus();
    });
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    }
});

// Auto-resize textarea
messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 150) + 'px';
});

// Functions
function updateModelInfo() {
    const modelName = modelSelect.options[modelSelect.selectedIndex].text;
    modelInfo.textContent = `Model: ${modelName}`;
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || isLoading) return;

    // Get settings
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        alert('Please enter your Groq API Key in Settings first!');
        settingsModal.classList.add('active');
        return;
    }

    // Add user message to UI
    addMessageToUI(message, 'user');
    messageInput.value = '';
    messageInput.style.height = 'auto';

    // Show typing indicator
    showTypingIndicator(true);

    // Add to chat history
    currentChat.push({ role: 'user', content: message });

    try {
        isLoading = true;
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: modelSelect.value,
                messages: currentChat,
                temperature: parseFloat(temperatureInput.value),
                max_tokens: parseInt(maxTokensInput.value),
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // Add AI response to UI and chat history
        addMessageToUI(aiResponse, 'ai');
        currentChat.push({ role: 'assistant', content: aiResponse });

    } catch (error) {
        console.error('Error:', error);
        addMessageToUI(`Sorry, I encountered an error: ${error.message}`, 'ai');
    } finally {
        showTypingIndicator(false);
        isLoading = false;
    }
}

function addMessageToUI(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Format message with line breaks and basic markdown
    let formattedMessage = message
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
    
    contentDiv.innerHTML = formattedMessage;
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator(show) {
    if (show) {
        typingIndicator.classList.add('visible');
    } else {
        typingIndicator.classList.remove('visible');
    }
}

function startNewChat() {
    if (currentChat.length === 0) return;
    
    if (confirm('Start a new chat? Your current conversation will be cleared.')) {
        currentChat = [];
        messagesContainer.innerHTML = `
            <div class="message ai-message welcome-message">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <h3>Hello! I'm your AI Assistant</h3>
                    <p>I can help you with questions, coding, writing, analysis, and more. How can I assist you today?</p>
                    <div class="suggestions">
                        <button class="suggestion-btn" data-prompt="Explain quantum computing in simple terms">Explain quantum computing</button>
                        <button class="suggestion-btn" data-prompt="Write a Python function to calculate factorial">Python factorial</button>
                        <button class="suggestion-btn" data-prompt="Help me write a professional email">Write an email</button>
                        <button class="suggestion-btn" data-prompt="What are the latest trends in AI?">AI trends</button>
                    </div>
                </div>
            </div>
        `;
        
        // Reattach event listeners to new suggestion buttons
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                messageInput.value = e.target.dataset.prompt;
                messageInput.focus();
            });
        });
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

function saveSettingsHandler() {
    const settings = {
        apiKey: apiKeyInput.value,
        temperature: parseFloat(temperatureInput.value),
        maxTokens: parseInt(maxTokensInput.value),
        model: modelSelect.value
    };
    
    localStorage.setItem('chatSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
    settingsModal.classList.remove('active');
}

// Initialize suggestion buttons
document.querySelectorAll('.suggestion-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        messageInput.value = e.target.dataset.prompt;
        messageInput.focus();
    });
});

// Welcome message - Add some example interactions
window.addEventListener('DOMContentLoaded', () => {
    // Focus on input field
    messageInput.focus();
});