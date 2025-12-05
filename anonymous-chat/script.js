// Supabase Configuration - YOUR CREDENTIALS
const SUPABASE_URL = 'https://dwivklunuucddhbnzmbl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3aXZrbHVudXVjZGRoYm56bWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NTU4NDEsImV4cCI6MjA3NTIzMTg0MX0.Rj800uYlaO4TtV6TA_ThUoHhhQy55E2A9boADLStuUI';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State Management
let currentUser = null;
let isAdmin = false;
let currentMessageToReport = null;
let emojiPickerVisible = false;

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
const userStatus = document.getElementById('userStatus');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    loadMessages();
    setupRealTime();
    loadOnlineUsers();
    setupEventListeners();
    
    // Auto-refresh online users every 30 seconds
    setInterval(loadOnlineUsers, 30000);
    
    // Theme initialization
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
    }
    
    // Update last active every minute
    setInterval(async () => {
        if (currentUser) {
            await supabase
                .from('users')
                .update({ last_active: new Date().toISOString() })
                .eq('id', currentUser.id);
        }
    }, 60000);
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
        
        // Close emoji picker
        const picker = document.getElementById('emojiPicker');
        if (emojiPickerVisible && !picker.contains(event.target) && !event.target.closest('.tool-btn')) {
            emojiPickerVisible = false;
            picker.style.display = 'none';
        }
    }
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
        
        if (error) {
            console.error('Error creating profile:', error);
            showNotification('Error creating user profile', 'error');
            return;
        }
        
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
            showNotification('Admin login failed. Creating admin account...', 'error');
            // Create admin account
            const { data: signupData, error: signupError } = await supabase.auth.signUp({
                email: 'admin@robby.com',
                password: 'admin123',
                options: {
                    data: {
                        username: 'fwrobby'
                    }
                }
            });
            
            if (signupError) {
                showNotification('Failed to create admin account', 'error');
                return;
            }
            
            showNotification('Admin account created. Please login again.', 'success');
            return;
        }
    } else {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            showNotification(error.message, 'error');
            return;
        }
    }
    
    toggleAuthModal();
    await checkAuth();
    showNotification('Login successful!', 'success');
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
        showNotification(error.message, 'error');
        return;
    }
    
    showNotification('Signup successful! Please check your email for verification.', 'success');
    toggleAuthModal();
}

async function logout() {
    await supabase.auth.signOut();
    currentUser = null;
    isAdmin = false;
    updateUIForGuest();
    showNotification('Logged out successfully', 'success');
}

// UI Update Functions
function updateUIForLoggedInUser() {
    userDisplayName.textContent = currentUser.username;
    userStatus.textContent = 'Online';
    userStatus.className = 'user-status';
    
    authBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    authBtn.onclick = logout;
    
    messageInput.disabled = false;
    messageInput.placeholder = `Message as ${currentUser.username}...`;
    sendBtn.disabled = false;
    mentionBtn.disabled = false;
    historyBtn.disabled = false;
    clearBtn.style.display = 'inline-block';
    
    if (isAdmin) {
        adminBtn.style.display = 'inline-block';
        mentionBtn.title = 'Mention @everyone';
        mentionBtn.innerHTML = '<i class="fas fa-bullhorn"></i>';
    } else {
        adminBtn.style.display = 'none';
        mentionBtn.title = 'Mention @admin';
        mentionBtn.innerHTML = '<i class="fas fa-at"></i>';
    }
}

function updateUIForGuest() {
    userDisplayName.textContent = 'Guest';
    userStatus.textContent = 'Offline';
    userStatus.className = 'user-status offline';
    
    authBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    authBtn.onclick = toggleAuthModal;
    
    messageInput.disabled = true;
    messageInput.placeholder = 'Login to chat...';
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
            .limit(100);
        
        if (error) throw error;
        
        const container = document.getElementById('chatMessages');
        container.innerHTML = '';
        
        if (messages.length === 0) {
            container.innerHTML = `
                <div class="welcome-message">
                    <i class="fas fa-comments"></i>
                    <h4>No messages yet</h4>
                    <p>Be the first to send a message!</p>
                </div>
            `;
            updateMessageCount(0);
            return;
        }
        
        // Group messages by date
        const groupedMessages = groupMessagesByDate(messages);
        
        for (const [date, dateMessages] of Object.entries(groupedMessages)) {
            // Add date separator
            const dateDiv = document.createElement('div');
            dateDiv.className = 'date-separator';
            dateDiv.innerHTML = `<span>${formatDate(date)}</span>`;
            container.appendChild(dateDiv);
            
            // Add messages for this date
            dateMessages.forEach(msg => {
                const messageDiv = createMessageElement(msg);
                container.appendChild(messageDiv);
            });
        }
        
        container.scrollTop = container.scrollHeight;
        updateMessageCount(messages.length);
    } catch (error) {
        console.error('Error loading messages:', error);
        chatMessages.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load messages. Please refresh.</p>
            </div>
        `;
    }
}

function groupMessagesByDate(messages) {
    return messages.reduce((groups, message) => {
        const date = new Date(message.created_at).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {});
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

function createMessageElement(msg) {
    const div = document.createElement('div');
    const isOwnMessage = msg.user_id === currentUser?.id;
    const canDelete = isOwnMessage || isAdmin;
    const isReported = msg.is_reported;
    
    div.className = `message ${isOwnMessage ? 'own' : ''} ${isReported ? 'reported' : ''}`;
    div.dataset.id = msg.id;
    
    const time = new Date(msg.created_at).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    let actions = '';
    
    if (canDelete) {
        actions += `
            <button onclick="deleteMessage('${msg.id}')" class="btn btn-sm btn-danger" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        `;
    }
    
    if (!isOwnMessage && currentUser && !isAdmin) {
        actions += `
            <button onclick="openReportModal('${msg.id}', '${msg.message}')" 
                    class="btn btn-sm btn-warning" title="Report">
                <i class="fas fa-flag"></i>
            </button>
        `;
    }
    
    if (isAdmin && isReported) {
        actions += `
            <button onclick="resolveReport('${msg.id}')" class="btn btn-sm btn-success" title="Resolve">
                <i class="fas fa-check"></i>
            </button>
        `;
    }
    
    div.innerHTML = `
        <div class="message-bubble">
            <div class="message-header">
                <span class="message-username">${msg.username}</span>
                <span class="message-time">${time}</span>
                ${msg.is_reported ? '<span class="badge danger">Reported</span>' : ''}
            </div>
            <div class="message-content">
                ${formatMessageContent(msg.message)}
                ${msg.image_url ? `
                    <div class="message-image-container">
                        <img src="${msg.image_url}" 
                             class="message-image" 
                             onclick="viewImage('${msg.image_url}')"
                             alt="Uploaded image">
                        <div class="image-actions">
                            <button onclick="downloadImage('${msg.image_url}')" class="btn btn-sm btn-secondary">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
            ${actions ? `<div class="message-actions">${actions}</div>` : ''}
        </div>
    `;
    
    return div;
}

function formatMessageContent(content) {
    if (!content) return '';
    
    // Convert URLs to links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let formatted = content.replace(urlRegex, url => 
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="message-link">${url}</a>`
    );
    
    // Highlight mentions
    formatted = formatted.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
    
    // Preserve line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
}

async function sendMessage() {
    const content = messageInput.value.trim();
    if (!content || !currentUser) return;
    
    if (content.length > 1000) {
        showNotification('Message too long (max 1000 characters)', 'error');
        return;
    }
    
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
        showNotification('Failed to send message', 'error');
        return;
    }
    
    messageInput.value = '';
    messageInput.focus();
    // Message will appear via real-time subscription
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
        showNotification('You can only delete your own messages', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to delete this message?')) {
        const { error } = await supabase
            .from('messages')
            .update({ deleted: true })
            .eq('id', messageId);
        
        if (error) {
            console.error('Error deleting message:', error);
            showNotification('Failed to delete message', 'error');
            return;
        }
        
        showNotification('Message deleted', 'success');
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
            showNotification('Failed to clear messages', 'error');
            return;
        }
        
        showNotification('Your messages have been deleted', 'success');
    }
}

// Report Functions
function openReportModal(messageId, messageText) {
    currentMessageToReport = messageId;
    document.getElementById('reportMessageText').textContent = messageText || '[No message content]';
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
        showNotification('Please provide a reason for reporting', 'error');
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
        showNotification('Failed to report message', 'error');
        return;
    }
    
    closeReportModal();
    showNotification('Message reported successfully', 'success');
}

// Admin Functions
function showAdminPanel() {
    if (!isAdmin) {
        showNotification('Admin access required', 'error');
        return;
    }
    
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
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`${tabName}Tab`).classList.add('active');
    event.target.classList.add('active');
}

async function loadReportedMessages() {
    const { data: messages, error } = await supabase
        .from('messages')
        .select('*, users!messages_reported_by_fkey(username)')
        .eq('is_reported', true)
        .eq('deleted', false)
        .order('reported_at', { ascending: false });
    
    if (error) {
        console.error('Error loading reported messages:', error);
        showNotification('Failed to load reported messages', 'error');
        return;
    }
    
    const container = document.getElementById('reportedMessages');
    
    if (!messages || messages.length === 0) {
        container.innerHTML = '<div class="empty-state">No reported messages</div>';
        return;
    }
    
    container.innerHTML = messages.map(msg => `
        <div class="reported-item">
            <div class="message-preview">
                <strong>${msg.username}</strong> 
                <small>(${new Date(msg.created_at).toLocaleString()})</small>
                <p>${msg.message || '[Image message]'}</p>
                ${msg.reported_by ? `<small>Reported by: ${msg.users?.username || 'Unknown'}</small>` : ''}
            </div>
            <div class="user-actions">
                <button onclick="resolveReport('${msg.id}')" class="btn btn-success btn-sm">
                    <i class="fas fa-check"></i> Resolve
                </button>
                <button onclick="deleteMessage('${msg.id}')" class="btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i> Delete
                </button>
                <button onclick="banUserByMessage('${msg.id}')" class="btn btn-warning btn-sm">
                    <i class="fas fa-ban"></i> Ban User
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
        showNotification('Failed to load users', 'error');
        return;
    }
    
    const container = document.getElementById('userList');
    
    if (!users || users.length === 0) {
        container.innerHTML = '<div class="empty-state">No users found</div>';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="user-item">
            <div class="user-info">
                <strong>${user.username}</strong>
                <span class="badge ${user.role}">${user.role}</span>
                ${user.is_banned ? '<span class="badge danger">Banned</span>' : ''}
                <small>Warnings: ${user.warnings}</small>
                <small>Joined: ${new Date(user.created_at).toLocaleDateString()}</small>
            </div>
            <div class="user-actions">
                ${!user.is_banned ? `
                    <button onclick="warnUser('${user.id}')" class="btn btn-warning btn-sm">
                        <i class="fas fa-exclamation-triangle"></i> Warn
                    </button>
                    <button onclick="banUser('${user.id}')" class="btn btn-danger btn-sm">
                        <i class="fas fa-ban"></i> Ban
                    </button>
                ` : `
                    <button onclick="unbanUser('${user.id}')" class="btn btn-success btn-sm">
                        <i class="fas fa-check-circle"></i> Unban
                    </button>
                `}
                ${isAdmin && user.role !== 'admin' ? `
                    <button onclick="deleteUser('${user.id}')" class="btn btn-danger btn-sm">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

async function loadAnalytics() {
    try {
        // Total messages
        const { count: totalMessages } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('deleted', false);
        
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
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

async function resolveReport(messageId) {
    const { error } = await supabase
        .from('messages')
        .update({ is_reported: false, reported_by: null, reported_at: null })
        .eq('id', messageId);
    
    if (error) {
        console.error('Error resolving report:', error);
        showNotification('Failed to resolve report', 'error');
        return;
    }
    
    showNotification('Report resolved', 'success');
    loadReportedMessages();
    loadMessages();
}

async function warnUser(userId) {
    const { data: user } = await supabase
        .from('users')
        .select('warnings, username')
        .eq('id', userId)
        .single();
    
    if (!user) return;
    
    const { error } = await supabase
        .from('users')
        .update({ warnings: user.warnings + 1 })
        .eq('id', userId);
    
    if (error) {
        console.error('Error warning user:', error);
        showNotification('Failed to warn user', 'error');
        return;
    }
    
    showNotification(`User ${user.username} warned successfully`, 'success');
    loadUsers();
}

async function banUser(userId) {
    if (confirm('Are you sure you want to ban this user?')) {
        const { data: user } = await supabase
            .from('users')
            .select('username')
            .eq('id', userId)
            .single();
        
        const { error } = await supabase
            .from('users')
            .update({ is_banned: true })
            .eq('id', userId);
        
        if (error) {
            console.error('Error banning user:', error);
            showNotification('Failed to ban user', 'error');
            return;
        }
        
        showNotification(`User ${user?.username || 'Unknown'} banned successfully`, 'success');
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
    const { data: user } = await supabase
        .from('users')
        .select('username')
        .eq('id', userId)
        .single();
    
    const { error } = await supabase
        .from('users')
        .update({ is_banned: false })
        .eq('id', userId);
    
    if (error) {
        console.error('Error unbanning user:', error);
        showNotification('Failed to unban user', 'error');
        return;
    }
    
    showNotification(`User ${user?.username || 'Unknown'} unbanned successfully`, 'success');
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
            showNotification('Failed to delete user', 'error');
            return;
        }
        
        showNotification('User deleted successfully', 'success');
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
        showNotification('Image must be less than 5MB', 'error');
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
        return;
    }
    
    const fileName = `${currentUser.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    
    const { data, error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);
    
    if (error) {
        console.error('Error uploading image:', error);
        showNotification('Failed to upload image', 'error');
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
    
    showNotification('Image uploaded successfully', 'success');
    
    // Clear file input
    event.target.value = '';
}

function viewImage(url) {
    window.open(url, '_blank');
}

function downloadImage(url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-image.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
                
                // Remove welcome message if it exists
                const welcomeMsg = document.querySelector('.welcome-message');
                if (welcomeMsg) {
                    welcomeMsg.remove();
                }
                
                // Add date separator if needed
                const messages = document.querySelectorAll('.message');
                if (messages.length > 0) {
                    const lastMessageDate = new Date(messages[messages.length - 1].dataset.createdAt || Date.now()).toDateString();
                    const newMessageDate = new Date(newMessage.created_at).toDateString();
                    
                    if (lastMessageDate !== newMessageDate) {
                        const dateDiv = document.createElement('div');
                        dateDiv.className = 'date-separator';
                        dateDiv.innerHTML = `<span>${formatDate(newMessageDate)}</span>`;
                        chatMessages.appendChild(dateDiv);
                    }
                }
                
                chatMessages.appendChild(messageElement);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                // Update message count
                const currentCount = parseInt(document.getElementById('messageCount').textContent) || 0;
                updateMessageCount(currentCount + 1);
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
        .on('postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'users'
            },
            () => {
                loadOnlineUsers();
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
    const onlineCount = document.getElementById('onlineCount');
    
    if (!users || users.length === 0) {
        container.innerHTML = '<div class="empty-state">No users online</div>';
        onlineCount.textContent = '0 online';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="online-user">
            <div class="user-indicator"></div>
            <span class="user-name">${user.username}</span>
            ${user.role === 'admin' ? '<span class="badge admin">Admin</span>' : ''}
        </div>
    `).join('');
    
    onlineCount.textContent = `${users.length} online`;
}

function updateMessageCount(count) {
    const messageCount = document.getElementById('messageCount');
    messageCount.textContent = `${count} messages`;
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
        showNotification('Failed to load history', 'error');
        return;
    }
    
    const historyWindow = window.open('', '_blank');
    historyWindow.document.write(`
        <html>
        <head>
            <title>Chat History - ${currentUser.username}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
                .message { margin: 15px 0; padding: 15px; border-left: 4px solid #4361ee; background: #f8f9fa; }
                .time { color: #666; font-size: 0.9em; margin-bottom: 5px; }
                .content { margin: 5px 0; }
                img { max-width: 300px; margin-top: 10px; border-radius: 8px; }
                h2 { color: #4361ee; }
            </style>
        </head>
        <body>
            <h2>Chat History - ${currentUser.username}</h2>
            <p>Showing last 100 messages</p>
            ${messages.map(msg => `
                <div class="message">
                    <div class="time">${new Date(msg.created_at).toLocaleString()}</div>
                    <div class="content">${msg.message || '[Image]'}</div>
                    ${msg.image_url ? `<img src="${msg.image_url}" style="max-width: 300px;">` : ''}
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
    showNotification(`Theme changed to ${isDark ? 'dark' : 'light'} mode`, 'success');
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
function toggleEmojiPicker() {
    const picker = document.getElementById('emojiPicker');
    emojiPickerVisible = !emojiPickerVisible;
    picker.style.display = emojiPickerVisible ? 'block' : 'none';
    
    // Position picker near input
    const inputRect = document.querySelector('.input-tools').getBoundingClientRect();
    picker.style.bottom = `${window.innerHeight - inputRect.top + 60}px`;
    picker.style.right = `${window.innerWidth - inputRect.right}px`;
}

function addEmoji(emoji) {
    if (!currentUser) return;
    messageInput.value += emoji;
    messageInput.focus();
    toggleEmojiPicker(); // Close after selecting
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS for notifications and extra styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--surface-light);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 1rem 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        transform: translateX(120%);
        transition: transform 0.3s ease;
        z-index: 9999;
        max-width: 400px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        border-left: 4px solid var(--success);
    }
    
    .notification-error {
        border-left: 4px solid var(--danger);
    }
    
    .notification i {
        font-size: 1.2rem;
    }
    
    .notification-success i {
        color: var(--success);
    }
    
    .notification-error i {
        color: var(--danger);
    }
    
    .date-separator {
        text-align: center;
        margin: 1.5rem 0;
        position: relative;
    }
    
    .date-separator::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--border);
    }
    
    .date-separator span {
        background: var(--surface-light);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--text-light);
        border: 1px solid var(--border);
        display: inline-block;
        position: relative;
        z-index: 1;
    }
    
    .dark-mode .date-separator span {
        background: var(--surface-dark);
        color: var(--text-dark);
        border-color: #333;
    }
    
    .mention {
        background: rgba(67, 97, 238, 0.1);
        color: var(--primary);
        padding: 0.125rem 0.5rem;
        border-radius: 4px;
        font-weight: 500;
    }
    
    .message-link {
        color: var(--primary);
        text-decoration: none;
        border-bottom: 1px dotted var(--primary);
    }
    
    .message-link:hover {
        border-bottom-style: solid;
    }
    
    .image-actions {
        margin-top: 0.5rem;
        display: flex;
        gap: 0.5rem;
    }
    
    .empty-state {
        text-align: center;
        padding: 2rem;
        color: var(--text-light);
        opacity: 0.6;
    }
    
    .dark-mode .empty-state {
        color: var(--text-dark);
    }
    
    .error-message {
        text-align: center;
        padding: 2rem;
        color: var(--danger);
    }
    
    .error-message i {
        font-size: 2rem;
        margin-bottom: 1rem;
    }
`;
document.head.appendChild(style);