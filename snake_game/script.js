const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Responsive canvas
let canvasSize = Math.min(window.innerWidth * 0.8, 420);
canvas.width = canvasSize;
canvas.height = canvasSize;

const box = 20;
let snake, direction, food, score, game;
let paused = false;
let darkTheme = true;
let soundOn = true;

// Sound effect
const eatSound = new Audio("https://www.soundjay.com/button/beep-07.wav");

// Start Game
function startGame() {
  snake = [{ x: 9 * box, y: 9 * box }];
  direction = null;
  score = 0;
  food = randomFood();
  document.getElementById("score").innerText = "Score: " + score;

  if (game) clearInterval(game);
  game = setInterval(draw, 120);
}

// Restart
document.getElementById("restartBtn").addEventListener("click", startGame);
// Start
document.getElementById("startBtn").addEventListener("click", startGame);
// Pause
document.getElementById("pauseBtn").addEventListener("click", () => {
  paused = !paused;
});
// Theme switch
document.getElementById("themeBtn").addEventListener("click", () => {
  darkTheme = !darkTheme;
  document.body.style.background = darkTheme
    ? "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
    : "linear-gradient(135deg, #ffecd2, #fcb69f)";
});
// Sound toggle
document.getElementById("soundBtn").addEventListener("click", () => {
  soundOn = !soundOn;
  document.getElementById("soundBtn").innerText = soundOn ? "🔊 Sound" : "🔇 Mute";
});

function randomFood() {
  return {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box,
  };
}

function draw() {
  if (paused) return;

  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "#00ff88" : "lime";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
    ctx.strokeStyle = "#111";
    ctx.strokeRect(snake[i].x, snake[i].y, box, box);
  }

  // Food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (direction === "LEFT") snakeX -= box;
  if (direction === "UP") snakeY -= box;
  if (direction === "RIGHT") snakeX += box;
  if (direction === "DOWN") snakeY += box;

  // Eat food
  if (snakeX === food.x && snakeY === food.y) {
    score++;
    document.getElementById("score").innerText = "Score: " + score;
    food = randomFood();
    if (soundOn) eatSound.play();
  } else {
    snake.pop();
  }

  let newHead = { x: snakeX, y: snakeY };

  // FIXED boundary check
  if (
    snakeX < 0 ||
    snakeY < 0 ||
    snakeX + box > canvas.width ||
    snakeY + box > canvas.height ||
    collision(newHead, snake)
  ) {
    clearInterval(game);
    alert("Game Over! Final Score: " + score);
  }

  snake.unshift(newHead);
}

function collision(head, array) {
  return array.some(segment => head.x === segment.x && head.y === segment.y);
}

// Keyboard
document.addEventListener("keydown", (e) => {
  if ((e.key === "ArrowLeft" || e.key === "a") && direction !== "RIGHT") direction = "LEFT";
  else if ((e.key === "ArrowUp" || e.key === "w") && direction !== "DOWN") direction = "UP";
  else if ((e.key === "ArrowRight" || e.key === "d") && direction !== "LEFT") direction = "RIGHT";
  else if ((e.key === "ArrowDown" || e.key === "s") && direction !== "UP") direction = "DOWN";
});

// Touch buttons
document.getElementById("up").addEventListener("click", () => {
  if (direction !== "DOWN") direction = "UP";
});
document.getElementById("down").addEventListener("click", () => {
  if (direction !== "UP") direction = "DOWN";
});
document.getElementById("left").addEventListener("click", () => {
  if (direction !== "RIGHT") direction = "LEFT";
});
document.getElementById("right").addEventListener("click", () => {
  if (direction !== "LEFT") direction = "RIGHT";
});

// Swipe gestures
let startX, startY;
canvas.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;
});

canvas.addEventListener("touchend", (e) => {
  const touch = e.changedTouches[0];
  let dx = touch.clientX - startX;
  let dy = touch.clientY - startY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && direction !== "LEFT") direction = "RIGHT";
    else if (dx < 0 && direction !== "RIGHT") direction = "LEFT";
  } else {
    if (dy > 0 && direction !== "UP") direction = "DOWN";
    else if (dy < 0 && direction !== "DOWN") direction = "UP";
  }
});
