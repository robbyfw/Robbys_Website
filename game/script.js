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
let birdW = 34;
let birdH = 24;
let gravity = 0.5;
let lift = -10;
let velocity = 0;

let pipes = [];
let pipeGap = 150;
let pipeWidth = 60;
let pipeSpeed = 2;
let score = 0;
let gameOver = false;
let gameStarted = false;

// Bird animation
let frame = 0;
let lastPipeSpawn = 0;
let scoredPipes = [];

// Create simple graphics for missing images
function createFallbackImages() {
  // Create bird image
  const birdCanvas = document.createElement('canvas');
  const birdCtx = birdCanvas.getContext('2d');
  birdCanvas.width = birdW;
  birdCanvas.height = birdH * 3;
  
  // Draw bird frames
  for (let i = 0; i < 3; i++) {
    birdCtx.fillStyle = i === 0 ? '#ffcc00' : i === 1 ? '#ffaa00' : '#ff9900';
    birdCtx.beginPath();
    birdCtx.arc(birdW/2, birdH/2 + i * birdH, birdH/2, 0, Math.PI * 2);
    birdCtx.fill();
    
    // Draw wing
    birdCtx.fillStyle = '#ff6600';
    birdCtx.beginPath();
    birdCtx.ellipse(birdW/2 - 5, birdH/2 + i * birdH, 8, 5, Math.PI/4, 0, Math.PI * 2);
    birdCtx.fill();
    
    // Draw eye
    birdCtx.fillStyle = 'black';
    birdCtx.beginPath();
    birdCtx.arc(birdW/2 + 5, birdH/2 - 3 + i * birdH, 2, 0, Math.PI * 2);
    birdCtx.fill();
    
    // Draw beak
    birdCtx.fillStyle = 'orange';
    birdCtx.beginPath();
    birdCtx.moveTo(birdW/2 + 8, birdH/2 + i * birdH);
    birdCtx.lineTo(birdW/2 + 15, birdH/2 + i * birdH);
    birdCtx.lineTo(birdW/2 + 8, birdH/2 + 5 + i * birdH);
    birdCtx.closePath();
    birdCtx.fill();
  }
  
  // Create background image
  const bgCanvas = document.createElement('canvas');
  const bgCtx = bgCanvas.getContext('2d');
  bgCanvas.width = 400;
  bgCanvas.height = 600;
  
  // Sky gradient
  const gradient = bgCtx.createLinearGradient(0, 0, 0, bgCanvas.height);
  gradient.addColorStop(0, '#70c5ce');
  gradient.addColorStop(1, '#8bd3dc');
  bgCtx.fillStyle = gradient;
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
  
  // Clouds
  bgCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  drawCloud(bgCtx, 100, 100, 60);
  drawCloud(bgCtx, 300, 150, 40);
  drawCloud(bgCtx, 200, 250, 50);
  drawCloud(bgCtx, 350, 300, 30);
  
  function drawCloud(ctx, x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size/2, 0, Math.PI * 2);
    ctx.arc(x + size/2, y - size/4, size/2, 0, Math.PI * 2);
    ctx.arc(x + size, y, size/2, 0, Math.PI * 2);
    ctx.arc(x + size/2, y + size/4, size/2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Create pipe image
  const pipeCanvas = document.createElement('canvas');
  const pipeCtx = pipeCanvas.getContext('2d');
  pipeCanvas.width = pipeWidth;
  pipeCanvas.height = 400;
  
  // Pipe color
  pipeCtx.fillStyle = '#73bf2e';
  pipeCtx.fillRect(0, 0, pipeCanvas.width, pipeCanvas.height);
  
  // Pipe details
  pipeCtx.fillStyle = '#5a9c23';
  pipeCtx.fillRect(0, 0, pipeCanvas.width, 20);
  pipeCtx.fillRect(0, pipeCanvas.height - 20, pipeCanvas.width, 20);
  
  // Pipe rim
  pipeCtx.fillStyle = '#4a7d1c';
  pipeCtx.fillRect(0, 0, pipeCanvas.width, 10);
  pipeCtx.fillRect(0, pipeCanvas.height - 10, pipeCanvas.width, 10);
  
  // Create path image
  const pathCanvas = document.createElement('canvas');
  const pathCtx = pathCanvas.getContext('2d');
  pathCanvas.width = 400;
  pathCanvas.height = 100;
  
  // Ground color
  pathCtx.fillStyle = '#ded895';
  pathCtx.fillRect(0, 0, pathCanvas.width, pathCanvas.height);
  
  // Ground texture
  pathCtx.fillStyle = '#d6ca7d';
  for (let i = 0; i < pathCanvas.width; i += 20) {
    pathCtx.fillRect(i, 0, 10, pathCanvas.height);
  }
  
  // Grass
  pathCtx.fillStyle = '#73bf2e';
  pathCtx.fillRect(0, 0, pathCanvas.width, 10);
  
  // Set fallback images if originals fail to load
  birdImg.onerror = function() {
    birdImg.src = birdCanvas.toDataURL();
  };
  
  bgImg.onerror = function() {
    bgImg.src = bgCanvas.toDataURL();
  };
  
  pipeImg.onerror = function() {
    pipeImg.src = pipeCanvas.toDataURL();
  };
  
  pathImg.onerror = function() {
    pathImg.src = pathCanvas.toDataURL();
  };
}

// Initialize fallback images
createFallbackImages();

// Controls
document.addEventListener("keydown", handleKeyDown);
canvas.addEventListener("click", handleJump);

function handleKeyDown(e) {
  if (e.code === "Space") {
    handleJump();
  }
}

function handleJump() {
  if (!gameStarted) {
    gameStarted = true;
    draw();
  }
  
  if (!gameOver) {
    velocity = lift;
  } else {
    restartGame();
  }
}

// Spawn pipes
function spawnPipe() {
  let topHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 200)) + 50;
  pipes.push({
    x: canvas.width,
    y: topHeight,
    scored: false
  });
}

// Restart game
function restartGame() {
  birdY = 150;
  velocity = 0;
  pipes = [];
  score = 0;
  gameOver = false;
  gameStarted = true;
  draw();
}

// Check collision
function checkCollision(pipe) {
  const pipeX = pipe.x;
  const topHeight = pipe.y;
  const bottomY = topHeight + pipeGap;
  
  // Bird hitbox
  const birdLeft = birdX + 5;
  const birdRight = birdX + birdW - 5;
  const birdTop = birdY + 5;
  const birdBottom = birdY + birdH - 5;
  
  // Pipe hitboxes
  const topPipeBottom = topHeight;
  const bottomPipeTop = bottomY;
  
  // Check if bird collides with top pipe
  if (birdRight > pipeX && birdLeft < pipeX + pipeWidth) {
    if (birdTop < topPipeBottom) {
      return true;
    }
  }
  
  // Check if bird collides with bottom pipe
  if (birdRight > pipeX && birdLeft < pipeX + pipeWidth) {
    if (birdBottom > bottomPipeTop) {
      return true;
    }
  }
  
  return false;
}

// Main game loop
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  if (!gameStarted) {
    // Start screen
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Flappy Bird", canvas.width / 2 - 80, canvas.height / 2 - 50);
    ctx.font = "20px Arial";
    ctx.fillText("Click or Press SPACE to start", canvas.width / 2 - 140, canvas.height / 2);
    return;
  }

  // Bird physics
  velocity += gravity;
  birdY += velocity;

  // Bird animation
  frame++;
  let spriteY = 0;
  if (frame % 20 < 7) spriteY = 0;
  else if (frame % 20 < 14) spriteY = birdH;
  else spriteY = birdH * 2;

  // Draw bird
  try {
    ctx.drawImage(birdImg, 0, spriteY, birdW, birdH, birdX, birdY, birdW, birdH);
  } catch (e) {
    // Fallback if sprite sheet format fails
    ctx.drawImage(birdImg, birdX, birdY, birdW, birdH);
  }

  // Draw pipes
  for (let i = 0; i < pipes.length; i++) {
    let pipe = pipes[i];
    let pipeX = pipe.x;
    let topHeight = pipe.y;

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
    pipe.x -= pipeSpeed;

    // Score when bird passes pipe
    if (!pipe.scored && pipeX + pipeWidth < birdX) {
      pipe.scored = true;
      score++;
    }

    // Collision detection
    if (checkCollision(pipe)) {
      gameOver = true;
    }
  }

  // Draw ground
  ctx.drawImage(pathImg, 0, canvas.height - 100, canvas.width, 100);

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
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2 - 40);
    
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("Final Score: " + score, canvas.width / 2 - 80, canvas.height / 2 + 10);
    
    ctx.font = "20px Arial";
    ctx.fillText("Click or Press SPACE to restart", canvas.width / 2 - 160, canvas.height / 2 + 50);
    return;
  }

  // Spawn pipes
  if (frame % 120 === 0) {
    spawnPipe();
  }

  requestAnimationFrame(draw);
}

// Start game
draw();