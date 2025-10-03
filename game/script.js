// Sidebar functionality
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');

hamburger.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  hamburger.classList.toggle('active');
});

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
  if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
    sidebar.classList.remove('open');
    hamburger.classList.remove('active');
  }
});

// Game code
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");

// Set canvas size
canvas.width = 400;
canvas.height = 600;

// Game variables
let birdX = 70;
let birdY = 300;
let birdW = 40;
let birdH = 30;
let gravity = 0.25;
let lift = -8;
let velocity = 0;

let pipes = [];
let pipeGap = 160;
let pipeWidth = 70;
let pipeSpeed = 2;
let score = 0;
let gameOver = false;
let gameStarted = false;

// Bird animation
let frame = 0;
let birdRotation = 0;

// Create single frame bird image (FIXED - no three birds issue)
function createSingleBirdImage() {
  const birdCanvas = document.createElement('canvas');
  const birdCtx = birdCanvas.getContext('2d');
  birdCanvas.width = birdW;
  birdCanvas.height = birdH;
  
  // Draw a single cute bird
  birdCtx.fillStyle = '#FFD700';
  birdCtx.beginPath();
  birdCtx.ellipse(birdW/2, birdH/2, birdW/2 - 2, birdH/2 - 2, 0, 0, Math.PI * 2);
  birdCtx.fill();
  
  // Wing
  birdCtx.fillStyle = '#FF8C00';
  birdCtx.beginPath();
  birdCtx.ellipse(birdW/2 - 8, birdH/2 + 2, 10, 6, -Math.PI/6, 0, Math.PI * 2);
  birdCtx.fill();
  
  // Eye
  birdCtx.fillStyle = 'white';
  birdCtx.beginPath();
  birdCtx.arc(birdW/2 + 8, birdH/2 - 3, 4, 0, Math.PI * 2);
  birdCtx.fill();
  
  birdCtx.fillStyle = 'black';
  birdCtx.beginPath();
  birdCtx.arc(birdW/2 + 9, birdH/2 - 3, 2, 0, Math.PI * 2);
  birdCtx.fill();
  
  // Beak
  birdCtx.fillStyle = '#FF6347';
  birdCtx.beginPath();
  birdCtx.moveTo(birdW/2 + 12, birdH/2);
  birdCtx.lineTo(birdW/2 + 20, birdH/2);
  birdCtx.lineTo(birdW/2 + 12, birdH/2 + 4);
  birdCtx.closePath();
  birdCtx.fill();
  
  return birdCanvas.toDataURL();
}

// Load images with fallbacks
const images = {
  bird: new Image(),
  bg: new Image(),
  pipe: new Image(),
  ground: new Image()
};

const singleBirdImage = createSingleBirdImage();

// Set image sources - FORCE using our single bird image
images.bird.src = singleBirdImage; // Always use our single bird image
images.bg.src = "background.png";
images.pipe.src = "pipe.png";
images.ground.src = "ground.png";

// Simple fallbacks for other images
images.bg.onerror = createFallbackBackground;
images.pipe.onerror = createFallbackPipe;
images.ground.onerror = createFallbackGround;

function createFallbackBackground() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 400;
  canvas.height = 600;
  
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(1, '#98D8E8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add clouds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  drawCloud(ctx, 100, 100, 60);
  drawCloud(ctx, 300, 150, 40);
  drawCloud(ctx, 200, 250, 50);
  
  function drawCloud(ctx, x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size/2, 0, Math.PI * 2);
    ctx.arc(x + size/2, y - size/4, size/2, 0, Math.PI * 2);
    ctx.arc(x + size, y, size/2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  images.bg.src = canvas.toDataURL();
}

function createFallbackPipe() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = pipeWidth;
  canvas.height = 400;
  
  ctx.fillStyle = '#2ECC71';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#27AE60';
  ctx.fillRect(0, 0, canvas.width, 25);
  ctx.fillRect(0, canvas.height - 25, canvas.width, 25);
  
  images.pipe.src = canvas.toDataURL();
}

function createFallbackGround() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 400;
  canvas.height = 100;
  
  ctx.fillStyle = '#D2B48C';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#B8860B';
  for (let i = 0; i < canvas.width; i += 15) {
    ctx.fillRect(i, 0, 8, canvas.height);
  }
  
  images.ground.src = canvas.toDataURL();
}

// Event listeners
document.addEventListener("keydown", handleKeyDown);
canvas.addEventListener("click", handleJump);
restartBtn.addEventListener("click", restartGame);

function handleKeyDown(e) {
  if (e.code === "Space") {
    e.preventDefault();
    handleJump();
  }
}

function handleJump() {
  if (!gameStarted) {
    gameStarted = true;
    draw();
    return;
  }
  
  if (!gameOver) {
    velocity = lift;
    birdRotation = -0.3;
  }
}

// Spawn pipes
function spawnPipe() {
  let topHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 220)) + 80;
  pipes.push({
    x: canvas.width,
    y: topHeight,
    scored: false
  });
}

// Restart game
function restartGame() {
  birdY = 300;
  velocity = 0;
  birdRotation = 0;
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
  
  // More forgiving hitbox
  const birdLeft = birdX + 8;
  const birdRight = birdX + birdW - 8;
  const birdTop = birdY + 8;
  const birdBottom = birdY + birdH - 8;
  
  // Check if bird collides with top pipe
  if (birdRight > pipeX && birdLeft < pipeX + pipeWidth) {
    if (birdTop < topHeight) {
      return true;
    }
  }
  
  // Check if bird collides with bottom pipe
  if (birdRight > pipeX && birdLeft < pipeX + pipeWidth) {
    if (birdBottom > bottomY) {
      return true;
    }
  }
  
  return false;
}

// Draw rotated bird (FIXED - uses single bird image)
function drawBird() {
  ctx.save();
  ctx.translate(birdX + birdW / 2, birdY + birdH / 2);
  
  // Rotate based on velocity
  birdRotation = Math.max(-0.5, Math.min(0.5, velocity * 0.03));
  ctx.rotate(birdRotation);
  
  // Draw the single bird image
  ctx.drawImage(images.bird, -birdW / 2, -birdH / 2, birdW, birdH);
  
  ctx.restore();
}

// Main game loop
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  try {
    ctx.drawImage(images.bg, 0, 0, canvas.width, canvas.height);
  } catch (e) {
    createFallbackBackground();
  }

  if (!gameStarted) {
    // Start screen
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#F1C40F";
    ctx.font = "bold 32px Poppins";
    ctx.fillText("FLAPPY BIRD", canvas.width / 2 - 110, canvas.height / 2 - 60);
    
    ctx.fillStyle = "white";
    ctx.font = "16px Poppins";
    ctx.fillText("Click or Press SPACE to start", canvas.width / 2 - 130, canvas.height / 2);
    return;
  }

  // Bird physics
  velocity += gravity;
  birdY += velocity;

  // Draw pipes
  for (let i = 0; i < pipes.length; i++) {
    let pipe = pipes[i];
    let pipeX = pipe.x;
    let topHeight = pipe.y;

    // Top pipe
    ctx.save();
    ctx.translate(pipeX + pipeWidth / 2, topHeight / 2);
    ctx.rotate(Math.PI); 
    try {
      ctx.drawImage(images.pipe, -pipeWidth / 2, -topHeight / 2, pipeWidth, topHeight);
    } catch (e) {
      ctx.fillStyle = '#2ECC71';
      ctx.fillRect(-pipeWidth / 2, -topHeight / 2, pipeWidth, topHeight);
    }
    ctx.restore();

    // Bottom pipe
    let bottomY = topHeight + pipeGap;
    let bottomHeight = canvas.height - bottomY - 100;
    try {
      ctx.drawImage(images.pipe, pipeX, bottomY, pipeWidth, bottomHeight);
    } catch (e) {
      ctx.fillStyle = '#2ECC71';
      ctx.fillRect(pipeX, bottomY, pipeWidth, bottomHeight);
    }

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
  try {
    ctx.drawImage(images.ground, 0, canvas.height - 100, canvas.width, 100);
  } catch (e) {
    ctx.fillStyle = '#D2B48C';
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
  }

  // Draw bird
  drawBird();

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
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.font = "bold 32px Poppins";
  ctx.strokeText(score, canvas.width / 2 - 10, 50);
  ctx.fillText(score, canvas.width / 2 - 10, 50);

  // Game over screen
  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#E74C3C";
    ctx.font = "bold 36px Poppins";
    ctx.fillText("GAME OVER", canvas.width / 2 - 110, canvas.height / 2 - 60);
    
    ctx.fillStyle = "white";
    ctx.font = "24px Poppins";
    ctx.fillText(`Score: ${score}`, canvas.width / 2 - 50, canvas.height / 2);
    
    ctx.fillStyle = "#BDC3C7";
    ctx.font = "16px Poppins";
    ctx.fillText("Click Restart to play again", canvas.width / 2 - 120, canvas.height / 2 + 70);
    return;
  }

  // Spawn pipes
  if (frame % 120 === 0) {
    spawnPipe();
  }

  frame++;
  requestAnimationFrame(draw);
}

// Start the game
draw();