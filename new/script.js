// Game State
const gameState = {
    currentRoom: 1,
    totalRooms: 5,
    timeLeft: 60 * 60, // 60 minutes in seconds
    timerInterval: null,
    selectedDifficulty: 60,
    answers: {
        room1: null,
        room2: null,
        room3: null,
        room4: [],
        room5: null
    },
    hints: {
        room1: "Try setting up equations: Let the digits be A, B, C. A + B + C = 12, A = 2B, C = A + B",
        room2: "Think about things that make sounds naturally without having physical forms",
        room3: "Look at the repeating sequence: Triangle, Square, Circle, Triangle, Square...",
        room4: "Rainbow colors are Red, Orange, Yellow, Green, Blue, Indigo, Violet. Skip blue, add black",
        room5: "Combine: Room1 code + First letter of Room2 answer + Room3 symbol + Number of Room4 colors"
    }
};

// DOM Elements
const elements = {
    screens: {
        start: document.getElementById('start-screen'),
        game: document.getElementById('game-screen'),
        win: document.getElementById('win-screen'),
        lose: document.getElementById('lose-screen')
    },
    timer: document.getElementById('timer'),
    roomNumber: document.getElementById('room-number'),
    hintModal: document.getElementById('hint-modal'),
    hintContent: document.getElementById('hint-content')
};

// Initialize Game
function initGame() {
    // Event Listeners
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            gameState.selectedDifficulty = parseInt(e.target.dataset.time);
            document.querySelectorAll('.difficulty-btn').forEach(b => b.style.background = '');
            e.target.style.background = 'rgba(255, 215, 0, 0.3)';
        });
    });

    document.getElementById('hint-btn').addEventListener('click', showHint);
    document.querySelector('.close').addEventListener('click', closeHint);
    window.addEventListener('click', (e) => {
        if (e.target === elements.hintModal) closeHint();
    });

    // Color button events
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const color = e.target.dataset.color;
            if (!gameState.answers.room4.includes(color)) {
                gameState.answers.room4.push(color);
                updateColorDisplay();
            }
        });
    });
}

// Start Game
function startGame() {
    gameState.timeLeft = gameState.selectedDifficulty * 60;
    showScreen('game');
    startTimer();
    showRoom(1);
}

// Timer Functions
function startTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
}

function updateTimer() {
    gameState.timeLeft--;
    
    if (gameState.timeLeft <= 0) {
        clearInterval(gameState.timerInterval);
        gameOver();
        return;
    }

    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    elements.timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Color warning when time is low
    if (gameState.timeLeft < 300) { // 5 minutes
        elements.timer.style.color = '#ff4444';
        elements.timer.style.animation = 'pulse 1s infinite';
    }
}

// Room Management
function showRoom(roomNumber) {
    // Hide all rooms
    document.querySelectorAll('.room').forEach(room => {
        room.classList.remove('active');
    });
    
    // Show current room
    const currentRoom = document.getElementById(`room-${roomNumber}`);
    if (currentRoom) {
        currentRoom.classList.add('active');
        gameState.currentRoom = roomNumber;
        elements.roomNumber.textContent = roomNumber;
    }
}

function nextRoom() {
    if (gameState.currentRoom < gameState.totalRooms) {
        showRoom(gameState.currentRoom + 1);
    } else {
        showRoom(5); // Final room
    }
}

// Puzzle Solutions
function checkNumberLock() {
    const input = document.getElementById('number-lock').value;
    const feedback = document.getElementById('room1-feedback');
    
    if (input === '336') {
        gameState.answers.room1 = input;
        feedback.textContent = '✅ Correct! The stone door creaks open...';
        feedback.className = 'feedback success';
        setTimeout(() => nextRoom(), 2000);
    } else {
        feedback.textContent = '❌ Incorrect. Try again!';
        feedback.className = 'feedback error';
    }
}

function checkWordPuzzle() {
    const input = document.getElementById('word-puzzle').value.toLowerCase();
    const feedback = document.getElementById('room2-feedback');
    
    if (input === 'echo') {
        gameState.answers.room2 = input;
        feedback.textContent = '✅ Correct! A hidden passage reveals itself...';
        feedback.className = 'feedback success';
        setTimeout(() => nextRoom(), 2000);
    } else {
        feedback.textContent = '❌ That doesn\'t sound right. Try again!';
        feedback.className = 'feedback error';
    }
}

function checkPattern() {
    const input = document.getElementById('pattern-select').value;
    const feedback = document.getElementById('room3-feedback');
    
    if (input === '○') {
        gameState.answers.room3 = input;
        feedback.textContent = '✅ Correct! The wall shifts and a new path appears...';
        feedback.className = 'feedback success';
        setTimeout(() => nextRoom(), 2000);
    } else {
        feedback.textContent = '❌ Not quite. Look at the pattern again.';
        feedback.className = 'feedback error';
    }
}

function updateColorDisplay() {
    const sequenceDisplay = document.getElementById('color-sequence');
    sequenceDisplay.textContent = gameState.answers.room4.map(color => 
        color.charAt(0).toUpperCase() + color.slice(1)
    ).join(' → ');
}

function resetColors() {
    gameState.answers.room4 = [];
    updateColorDisplay();
}

function checkColorCode() {
    const correctSequence = ['red', 'orange', 'yellow', 'green', 'purple', 'black'];
    const feedback = document.getElementById('room4-feedback');
    
    if (JSON.stringify(gameState.answers.room4) === JSON.stringify(correctSequence)) {
        feedback.textContent = '✅ Correct! The color panel lights up...';
        feedback.className = 'feedback success';
        setTimeout(() => nextRoom(), 2000);
    } else {
        feedback.textContent = '❌ Incorrect sequence. Remember: rainbow order, skip blue, add black';
        feedback.className = 'feedback error';
    }
}

function checkFinalCode() {
    const input = document.getElementById('final-code').value.toUpperCase();
    const feedback = document.getElementById('room5-feedback');
    
    // Calculate expected code
    const room1Code = gameState.answers.room1;
    const room2FirstLetter = gameState.answers.room2 ? gameState.answers.room2.charAt(0).toUpperCase() : '';
    const room3Symbol = gameState.answers.room3;
    const room4Count = gameState.answers.room4.length;
    
    const expectedCode = `${room1Code}${room2FirstLetter}${room3Symbol}${room4Count}`;
    
    if (input === expectedCode) {
        feedback.textContent = '✅ Congratulations! The final door opens!';
        feedback.className = 'feedback success';
        clearInterval(gameState.timerInterval);
        setTimeout(winGame, 2000);
    } else {
        feedback.textContent = '❌ Incorrect final code. Check your previous answers.';
        feedback.className = 'feedback error';
    }
}

// Hint System
function showHint() {
    elements.hintContent.textContent = gameState.hints[`room${gameState.currentRoom}`];
    elements.hintModal.style.display = 'block';
}

function closeHint() {
    elements.hintModal.style.display = 'none';
}

// Game End States
function winGame() {
    document.getElementById('time-remaining').textContent = elements.timer.textContent;
    document.getElementById('rooms-completed').textContent = gameState.totalRooms;
    showScreen('win');
}

function gameOver() {
    showScreen('lose');
}

function restartGame() {
    // Reset game state
    gameState.currentRoom = 1;
    gameState.answers = {
        room1: null,
        room2: null,
        room3: null,
        room4: [],
        room5: null
    };
    
    // Clear inputs
    document.getElementById('number-lock').value = '';
    document.getElementById('word-puzzle').value = '';
    document.getElementById('pattern-select').value = '';
    document.getElementById('final-code').value = '';
    resetColors();
    
    // Clear feedback
    document.querySelectorAll('.feedback').forEach(fb => {
        fb.textContent = '';
        fb.className = 'feedback';
    });
    
    showScreen('start');
}

// Utility Functions
function showScreen(screenName) {
    Object.values(elements.screens).forEach(screen => {
        screen.classList.remove('active');
    });
    elements.screens[screenName].classList.add('active');
}

// Add CSS for pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
`;
document.head.appendChild(style);

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initGame);