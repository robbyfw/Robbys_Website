const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

// Load images
const birdImg = new Image();
birdImg.src = "bird.png";

const bgImg = new Image();
bgImg.src = "background.png";

const pipeImg = new Image();
pipeImg.src = "pipe.png";

const pathImg = new Image();
pathImg.src = "path.png";

// Game variables
let birdX = 50;
let birdY = 150;
let birdW = 34;   // crop width
let birdH = 24;   // crop height
let gravity = 0.5;
let lift = -8;
let velocity = 0;

let pipes = [];
let pipeGap = 120;
let pipeWidth = 50;
let pipeSpeed = 2;
let score = 0;
let gameOver = false;

// Bird flap animation
let frame = 0;

// Controls
document.addEventListener("keydown", handleJump);
document.addEventListener("click", handleJump);

function handleJump() {
  if (!gameOver) {
    velocity = lift;
  } else {
    restartGame();
  }
}

// Spawn pipes
function spawnPipe() {
  let topHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 120)) + 20;
  pipes.push({
    x: canvas.width,
    y: topHeight
  });
}

// Restart game
function restartGame() {
  birdY = 150;
  velocity = 0;
  pipes = [];
  score = 0;
  gameOver = false;
  draw();
}

// Main game loop
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  // Bird physics
  velocity += gravity;
  birdY += velocity;

  // Bird animation (3-frame cycle if sprite sheet)
  frame++;
  let spriteY = 0;
  if (frame % 20 < 7) spriteY = 0;
  else if (frame % 20 < 14) spriteY = birdH;
  else spriteY = birdH * 2;

  try {
    ctx.drawImage(birdImg, 0, spriteY, birdW, birdH, birdX, birdY, birdW, birdH);
  } catch (e) {
    ctx.drawImage(birdImg, birdX, birdY, birdW, birdH); // fallback
  }

  // Ground
  ctx.drawImage(pathImg, 0, canvas.height - 100, canvas.width, 100);

  // Pipes
  for (let i = 0; i < pipes.length; i++) {
    let pipeX = pipes[i].x;
    let topHeight = pipes[i].y;

    // Top pipe
    ctx.save();
    ctx.translate(pipeX + pipeWidth / 2, topHeight / 2);
    ctx.rotate(Math.PI); 
    ctx.drawImage(pipeImg, -pipeWidth / 2, -topHeight / 2, pipeWidth, topHeight);
    ctx.restore();

    // Bottom pipe
    let bottomY = topHeight + pipeGap;
    let bottomHeight = canvas.height - bottomY - 100;
    ctx.drawImage(pipeImg, pipeX, bottomY, pipeWidth, bottomHeight);

    // Move pipe
    pipes[i].x -= pipeSpeed;

    // Collision detection
    if (
      birdX < pipeX + pipeWidth &&
      birdX + birdW > pipeX &&
      (birdY < topHeight || birdY + birdH > bottomY)
    ) {
      gameOver = true;
    }

    // Score
    if (pipeX + pipeWidth === birdX) score++;
  }

  // Ground/ceiling collision
  if (birdY + birdH >= canvas.height - 100 || birdY <= 0) {
    gameOver = true;
  }

  // Remove old pipes
  if (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
    pipes.shift();
  }

  // Draw score
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 10, 30);

  // Game over screen
  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", canvas.width / 6, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Press any key or click to restart", canvas.width / 8, canvas.height / 2 + 40);
    return;
  }

  requestAnimationFrame(draw);
}

// Pipe spawner
setInterval(() => {
  if (!gameOver) spawnPipe();
}, 2000);

// Start game
draw();