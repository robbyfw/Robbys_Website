const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 20;
let snake = [{ x: 9 * box, y: 9 * box }];
let direction;
let food = {
  x: Math.floor(Math.random() * 20) * box,
  y: Math.floor(Math.random() * 20) * box,
};
let score = 0;
let game;

// Draw food with gradient
function drawFood(x, y) {
  const gradient = ctx.createRadialGradient(x + 10, y + 10, 5, x + 10, y + 10, 15);
  gradient.addColorStop(0, "#ff6f61");
  gradient.addColorStop(1, "#ffcc00");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x + box / 2, y + box / 2, box / 2 - 2, 0, 2 * Math.PI);
  ctx.fill();
}

// Draw snake with rounded blocks
function drawSnakePart(x, y) {
  ctx.fillStyle = "#00ff88";
  ctx.shadowBlur = 8;
  ctx.shadowColor = "#00ffaa";
  ctx.fillRect(x, y, box, box);
  ctx.shadowBlur = 0;
}

// Controls
document.addEventListener("keydown", directionControl);
function directionControl(event) {
  if (event.keyCode === 37 && direction !== "RIGHT") direction = "LEFT";
  else if (event.keyCode === 38 && direction !== "DOWN") direction = "UP";
  else if (event.keyCode === 39 && direction !== "LEFT") direction = "RIGHT";
  else if (event.keyCode === 40 && direction !== "UP") direction = "DOWN";
}

// Main draw function
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw food
  drawFood(food.x, food.y);

  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    drawSnakePart(snake[i].x, snake[i].y);
  }

  // Snake head
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (direction === "LEFT") snakeX -= box;
  if (direction === "UP") snakeY -= box;
  if (direction === "RIGHT") snakeX += box;
  if (direction === "DOWN") snakeY += box;

  // Eat food
  if (snakeX === food.x && snakeY === food.y) {
    score++;
    document.getElementById("score").innerText = score;
    food = {
      x: Math.floor(Math.random() * 20) * box,
      y: Math.floor(Math.random() * 20) * box,
    };
  } else {
    snake.pop();
  }

  let newHead = { x: snakeX, y: snakeY };

  // Game over conditions
  if (
    snakeX < 0 ||
    snakeY < 0 ||
    snakeX >= canvas.width ||
    snakeY >= canvas.height ||
    collision(newHead, snake)
  ) {
    clearInterval(game);
    alert("Game Over! Your score: " + score);
  }

  snake.unshift(newHead);
}

// Collision check
function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) {
      return true;
    }
  }
  return false;
}

// Start button
document.getElementById("startBtn").addEventListener("click", () => {
  clearInterval(game);
  snake = [{ x: 9 * box, y: 9 * box }];
  direction = null;
  score = 0;
  document.getElementById("score").innerText = score;
  food = {
    x: Math.floor(Math.random() * 20) * box,
    y: Math.floor(Math.random() * 20) * box,
  };
  game = setInterval(draw, 120);
});
