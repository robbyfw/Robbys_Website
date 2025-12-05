// Supabase Configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State Management
let currentUser = null;
let isAdmin = false;
let currentMessageToReport = null;

// DOM Elements
const authBtn = document.getElementById('authBtn');
const adminBtn = document.getElementById('adminBtn');
const clearBtn = document.getElementById('clearBtn');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const mentionBtn = document.getElementById('mentionBtn');
const historyBtn = document.getElementById('historyBtn');
const chatMessages = document.getElementById('chatMessages');
const userDisplayName = document.getElementById('userDisplayName');
const userRoleBadge = document.getElementById('userRoleBadge');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    loadMessages();
    setupRealTime();
    loadOnlineUsers();
    
    // Auto-refresh online users every 30 seconds
    setInterval(loadOnlineUsers, 30000);
    
    // Theme initialization
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
    }
    
    // Setup event listeners
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Send message on Enter
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    sendBtn.addEventListener('click', sendMessage);
    
    // Auth forms
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin();
    });
    
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleSignup();
    });
    
    // Image upload
    document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
}

// Authentication Functions
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        await syncUserProfile(user);
        updateUIForLoggedInUser();
    } else {
        updateUIForGuest();
    }
}

async function syncUserProfile(user) {
    const { data: profile } = await supabase
        .from('users')
        .select('username, role, is_banned, warnings')
        .eq('id', user.id)
        .single();
    
    if (!profile) {
        // Create user profile if doesn't exist
        const { error } = await supabase
            .from('users')
            .insert([{
                id: user.id,
                username: user.email?.split('@')[0] || 'user',
                email: user.email,
                role: user.email === 'admin@robby.com' ? 'admin' : 'user'
            }]);
        
        if (error) console.error('Error creating profile:', error);
        
        currentUser = {
            id: user.id,
            username: user.email?.split('@')[0] || 'user',
            role: user.email === 'admin@robby.com' ? 'admin' : 'user'
        };
    } else {
        currentUser = {
            id: user.id,
            username: profile.username,
            role: profile.role,
            is_banned: profile.is_banned,
            warnings: profile.warnings
        };
    }
    
    isAdmin = currentUser.role === 'admin';
    
    // Update last active
    await supabase
        .from('users')
        .update({ last_active: new Date().toISOString() })
        .eq('id', user.id);
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Special admin login
    if (email === 'fwrobby' && password === 'm.asim12') {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'admin@robby.com',
            password: 'admin123'
        });
        
        if (error) {
            alert('Admin login failed. Please contact system administrator.');
            return;
        }
    } else {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            alert(error.message);
            return;
        }
    }
    
    toggleAuthModal();
    await checkAuth();
}

async function handleSignup() {
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username
            }
        }
    });
    
    if (error) {
        alert(error.message);
        return;
    }
    
    alert('Signup successful! Please check your email for verification.');
    toggleAuthModal();
}

async function logout() {
    await supabase.auth.signOut();
    currentUser = null;
    isAdmin = false;
    updateUIForGuest();
}

// UI Update Functions
function updateUIForLoggedInUser() {
    userDisplayName.textContent = currentUser.username;
    userRoleBadge.textContent = currentUser.role;
    userRoleBadge.className = `badge ${currentUser.role}`;
    userRoleBadge.style.display = 'inline-block';
    
    authBtn.textContent = 'Logout';
    authBtn.onclick = logout;
    
    messageInput.disabled = false;
    sendBtn.disabled = false;
    mentionBtn.disabled = false;
    historyBtn.disabled = false;
    clearBtn.style.display = 'inline-block';
    
    if (isAdmin) {
        adminBtn.style.display = 'inline-block';
        mentionBtn.innerHTML = '<i class="fas fa-at"></i> @everyone';
        mentionBtn.onclick = mentionEveryone;
    } else {
        adminBtn.style.display = 'none';
        mentionBtn.innerHTML = '<i class="fas fa-at"></i> Admin';
        mentionBtn.onclick = mentionAdmin;
    }
}

function updateUIForGuest() {
    userDisplayName.textContent = 'Guest';
    userRoleBadge.style.display = 'none';
    
    authBtn.textContent = 'Login';
    authBtn.onclick = toggleAuthModal;
    
    messageInput.disabled = true;
    sendBtn.disabled = true;
    mentionBtn.disabled = true;
    historyBtn.disabled = true;
    adminBtn.style.display = 'none';
    clearBtn.style.display = 'none';
}

// Message Functions
async function loadMessages() {
    try {
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('deleted', false)
            .order('created_at', { ascending: true })
            .limit(50);
        
        if (error) throw error;
        
        chatMessages.innerHTML = '';
        
        messages.forEach(msg => {
            const messageDiv = createMessageElement(msg);
            chatMessages.appendChild(messageDiv);
        });
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('Error loading messages:', error);
        chatMessages.innerHTML = '<div class="error">Error loading messages</div>';
    }
}

function createMessageElement(msg) {
    const div = document.createElement('div');
    div.className = `message ${msg.user_id === currentUser?.id ? 'own' : ''}`;
    div.dataset.id = msg.id;
    
    const isOwnMessage = msg.user_id === currentUser?.id;
    const canDelete = isOwnMessage || isAdmin;
    
    let actions = '';
    
    if (canDelete) {
        actions += `<button onclick="deleteMessage('${msg.id}')" class="btn btn-danger btn-sm">
            <i class="fas fa-trash"></i>
        </button>`;
    }
    
    if (!isOwnMessage && currentUser && !isAdmin) {
        actions += `<button onclick="openReportModal('${msg.id}', '${msg.message}')" 
                      class="btn btn-warning btn-sm">
            <i class="fas fa-flag"></i>
        </button>`;
    }
    
    if (isAdmin && msg.is_reported) {
        actions += `<span class="badge danger" style="background: var(--danger);">Reported</span>`;
    }
    
    const time = new Date(msg.created_at).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    div.innerHTML = `
        <div class="message-header">
            <span class="message-username">${msg.username}</span>
            <span class="message-time">${time}</span>
        </div>
        <div class="message-content">
            ${formatMessageContent(msg.message)}
            ${msg.image_url ? `<img src="${msg.image_url}" class="message-image" onclick="viewImage('${msg.image_url}')">` : ''}
        </div>
        ${actions ? `<div class="message-actions">${actions}</div>` : ''}
    `;
    
    return div;
}

function formatMessageContent(content) {
    // Convert URLs to links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.replace(urlRegex, url => 
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
    );
}

async function sendMessage() {
    const content = messageInput.value.trim();
    if (!content || !currentUser) return;
    
    const message = {
        user_id: currentUser.id,
        username: currentUser.username,
        message: content,
        created_at: new Date().toISOString()
    };
    
    const { error } = await supabase
        .from('messages')
        .insert([message]);
    
    if (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
        return;
    }
    
    messageInput.value = '';
    loadMessages(); // Reload to show new message
}

async function deleteMessage(messageId) {
    if (!currentUser) return;
    
    const { data: message } = await supabase
        .from('messages')
        .select('user_id')
        .eq('id', messageId)
        .single();
    
    if (!message) return;
    
    // Check permissions
    if (message.user_id !== currentUser.id && !isAdmin) {
        alert('You can only delete your own messages');
        return;
    }
    
    if (confirm('Are you sure you want to delete this message?')) {
        const { error } = await supabase
            .from('messages')
            .update({ deleted: true })
            .eq('id', messageId);
        
        if (error) {
            console.error('Error deleting message:', error);
            alert('Failed to delete message');
            return;
        }
        
        loadMessages();
    }
}

async function clearChat() {
    if (!currentUser) return;
    
    if (confirm('Delete all your messages?')) {
        const { error } = await supabase
            .from('messages')
            .update({ deleted: true })
            .eq('user_id', currentUser.id)
            .eq('deleted', false);
        
        if (error) {
            console.error('Error clearing messages:', error);
            alert('Failed to clear messages');
            return;
        }
        
        loadMessages();
        alert('Your messages have been deleted');
    }
}

// Report Functions
function openReportModal(messageId, messageText) {
    currentMessageToReport = messageId;
    document.getElementById('reportMessageText').textContent = messageText;
    document.getElementById('reportModal').style.display = 'block';
}

function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
    currentMessageToReport = null;
    document.getElementById('reportReason').value = '';
}

async function submitReport() {
    if (!currentMessageToReport || !currentUser) return;
    
    const reason = document.getElementById('reportReason').value.trim();
    if (!reason) {
        alert('Please provide a reason for reporting');
        return;
    }
    
    const { error } = await supabase
        .from('messages')
        .update({
            is_reported: true,
            reported_by: currentUser.id,
            reported_at: new Date().toISOString()
        })
        .eq('id', currentMessageToReport);
    
    if (error) {
        console.error('Error reporting message:', error);
        alert('Failed to report message');
        return;
    }
    
    closeReportModal();
    alert('Message reported successfully');
    loadMessages();
}

// Admin Functions
function showAdminPanel() {
    if (!isAdmin) return;
    
    loadReportedMessages();
    loadUsers();
    loadAnalytics();
    document.getElementById('adminModal').style.display = 'block';
}

function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
}

function showAdminTab(tabName) {
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.style.display = 'none';
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`${tabName}Tab`).style.display = 'block';
    event.target.classList.add('active');
}

async function loadReportedMessages() {
    const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('is_reported', true)
        .eq('deleted', false)
        .order('reported_at', { ascending: false });
    
    if (error) {
        console.error('Error loading reported messages:', error);
        return;
    }
    
    const container = document.getElementById('reportedMessages');
    container.innerHTML = messages.map(msg => `
        <div class="reported-message">
            <p><strong>${msg.username}:</strong> ${msg.message}</p>
            <p class="small">Reported at: ${new Date(msg.reported_at).toLocaleString()}</p>
            <div class="action-buttons">
                <button onclick="resolveReport('${msg.id}')" class="btn btn-success btn-sm">
                    Resolve
                </button>
                <button onclick="deleteMessage('${msg.id}')" class="btn btn-danger btn-sm">
                    Delete
                </button>
                <button onclick="banUserByMessage('${msg.id}')" class="btn btn-warning btn-sm">
                    Ban User
                </button>
            </div>
        </div>
    `).join('');
}

async function loadUsers() {
    const { data: users, error } = await supabase
        .from('users')
        .select('id, username, role, is_banned, warnings, created_at')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error loading users:', error);
        return;
    }
    
    const container = document.getElementById('userList');
    container.innerHTML = users.map(user => `
        <div class="user-item">
            <div class="user-info">
                <strong>${user.username}</strong>
                <span class="badge ${user.role}">${user.role}</span>
                ${user.is_banned ? '<span class="badge danger">Banned</span>' : ''}
                <span class="small">Warnings: ${user.warnings}</span>
            </div>
            <div class="user-actions">
                ${!user.is_banned ? `
                    <button onclick="warnUser('${user.id}')" class="btn btn-warning btn-sm">
                        Warn
                    </button>
                    <button onclick="banUser('${user.id}')" class="btn btn-danger btn-sm">
                        Ban
                    </button>
                ` : `
                    <button onclick="unbanUser('${user.id}')" class="btn btn-success btn-sm">
                        Unban
                    </button>
                `}
                ${isAdmin && user.role !== 'admin' ? `
                    <button onclick="deleteUser('${user.id}')" class="btn btn-danger btn-sm">
                        Delete
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

async function loadAnalytics() {
    // Total messages
    const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });
    
    // Total users
    const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
    
    // Reported today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: reportedToday } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_reported', true)
        .gte('reported_at', today.toISOString());
    
    document.getElementById('totalMessages').textContent = totalMessages || 0;
    document.getElementById('totalUsers').textContent = totalUsers || 0;
    document.getElementById('reportedToday').textContent = reportedToday || 0;
}

async function resolveReport(messageId) {
    const { error } = await supabase
        .from('messages')
        .update({ is_reported: false, reported_by: null, reported_at: null })
        .eq('id', messageId);
    
    if (error) {
        console.error('Error resolving report:', error);
        alert('Failed to resolve report');
        return;
    }
    
    loadReportedMessages();
    loadMessages();
}

async function warnUser(userId) {
    const { data: user } = await supabase
        .from('users')
        .select('warnings')
        .eq('id', userId)
        .single();
    
    if (!user) return;
    
    const { error } = await supabase
        .from('users')
        .update({ warnings: user.warnings + 1 })
        .eq('id', userId);
    
    if (error) {
        console.error('Error warning user:', error);
        alert('Failed to warn user');
        return;
    }
    
    alert('User warned successfully');
    loadUsers();
}

async function banUser(userId) {
    if (confirm('Are you sure you want to ban this user?')) {
        const { error } = await supabase
            .from('users')
            .update({ is_banned: true })
            .eq('id', userId);
        
        if (error) {
            console.error('Error banning user:', error);
            alert('Failed to ban user');
            return;
        }
        
        alert('User banned successfully');
        loadUsers();
    }
}

async function banUserByMessage(messageId) {
    const { data: message } = await supabase
        .from('messages')
        .select('user_id')
        .eq('id', messageId)
        .single();
    
    if (message) {
        await banUser(message.user_id);
    }
}

async function unbanUser(userId) {
    const { error } = await supabase
        .from('users')
        .update({ is_banned: false })
        .eq('id', userId);
    
    if (error) {
        console.error('Error unbanning user:', error);
        alert('Failed to unban user');
        return;
    }
    
    alert('User unbanned successfully');
    loadUsers();
}

async function deleteUser(userId) {
    if (confirm('Permanently delete this user and all their messages?')) {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);
        
        if (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
            return;
        }
        
        alert('User deleted successfully');
        loadUsers();
    }
}

// Mention Functions
function mentionAdmin() {
    if (!currentUser) return;
    messageInput.value += '@admin ';
    messageInput.focus();
}

function mentionEveryone() {
    if (!isAdmin) return;
    messageInput.value += '@everyone ';
    messageInput.focus();
}

// Image Upload
function triggerImageUpload() {
    document.getElementById('imageUpload').click();
}

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file || !currentUser) return;
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }
    
    const fileName = `${currentUser.id}/${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);
    
    if (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
        return;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);
    
    // Send message with image
    const message = {
        user_id: currentUser.id,
        username: currentUser.username,
        message: '[Image]',
        image_url: publicUrl,
        created_at: new Date().toISOString()
    };
    
    await supabase
        .from('messages')
        .insert([message]);
    
    loadMessages();
    
    // Clear file input
    event.target.value = '';
}

function viewImage(url) {
    window.open(url, '_blank');
}

// Real-time Updates
function setupRealTime() {
    supabase
        .channel('messages')
        .on('postgres_changes', 
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'messages',
                filter: 'deleted=eq.false'
            }, 
            (payload) => {
                const newMessage = payload.new;
                const messageElement = createMessageElement(newMessage);
                chatMessages.appendChild(messageElement);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        )
        .on('postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages'
            },
            () => {
                loadMessages();
            }
        )
        .subscribe();
}

// Online Users
async function loadOnlineUsers() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: users, error } = await supabase
        .from('users')
        .select('username, role')
        .gte('last_active', fiveMinutesAgo)
        .eq('is_banned', false)
        .order('username');
    
    if (error) {
        console.error('Error loading online users:', error);
        return;
    }
    
    const container = document.getElementById('onlineUsersList');
    container.innerHTML = users.map(user => `
        <div class="online-user">
            <span class="user-dot"></span>
            ${user.username}
            ${user.role === 'admin' ? '<span class="badge admin">Admin</span>' : ''}
        </div>
    `).join('');
}

// History
async function loadHistory() {
    if (!currentUser) return;
    
    const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(100);
    
    if (error) {
        console.error('Error loading history:', error);
        alert('Failed to load history');
        return;
    }
    
    const historyWindow = window.open('', '_blank');
    historyWindow.document.write(`
        <html>
        <head>
            <title>Chat History - ${currentUser.username}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .message { margin: 10px 0; padding: 10px; border-left: 3px solid #4361ee; }
                .time { color: #666; font-size: 0.9em; }
            </style>
        </head>
        <body>
            <h2>Chat History - ${currentUser.username}</h2>
            ${messages.map(msg => `
                <div class="message">
                    <div class="time">${new Date(msg.created_at).toLocaleString()}</div>
                    <div>${msg.message}</div>
                    ${msg.image_url ? `<img src="${msg.image_url}" style="max-width: 300px; margin-top: 10px;">` : ''}
                </div>
            `).join('')}
        </body>
        </html>
    `);
}

// Theme Toggle
function toggleTheme() {
    document.documentElement.classList.toggle('dark-mode');
    const isDark = document.documentElement.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Auth Modal
function toggleAuthModal() {
    const modal = document.getElementById('authModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function switchAuthTab(tab) {
    document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
}

// Emoji Functions
function addEmoji(emoji) {
    if (!currentUser) return;
    messageInput.value += emoji;
    messageInput.focus();
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.getElementsByClassName('modal');
    for (let modal of modals) {
        if (event.target === modal) {
            modal.style.display = 'none';
            if (modal.id === 'reportModal') {
                closeReportModal();
            }
        }
    }
}