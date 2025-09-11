/* 
  Snake Game — script.js
  - Responsive grid-based snake using canvas
  - Keyboard, touch buttons, swipe support
  - Start/Pause/Restart, Speed slider, Grid toggle
  - Theme toggle (dark/light), Sound toggle
  - Highscore stored in localStorage
  - Proper boundary: dies only when fully outside grid
*/

/* ------ DOM elements ------ */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const themeBtn = document.getElementById('themeBtn');
const soundBtn = document.getElementById('soundBtn');

const speedRange = document.getElementById('speedRange');
const gridToggle = document.getElementById('gridToggle');

const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');

/* touch buttons */
const btnUp = document.getElementById('btnUp');
const btnDown = document.getElementById('btnDown');
const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');

/* ------ Game variables (grid-based) ------ */
let cols = 20;           // will be recalculated on resize
let rows = 20;
let cell = 28;           // visual cell size in px (base) — recalculated to fit canvas
let dpr = window.devicePixelRatio || 1;

let snake = [];          // array of {x,y} (grid coords)
let dir = { x: 1, y: 0 }; // current direction
let nextDir = { x: 1, y: 0 };
let food = null;
let score = 0;
let highscore = parseInt(localStorage.getItem('snakeHigh') || '0', 10);
highscoreEl.textContent = highscore;

let running = false;
let paused = false;
let tickTimer = null;
let speed = parseInt(speedRange.value, 10); // affects tick interval
let gridVisible = false;

let soundOn = true;
let darkTheme = true;

/* short sound effect (small click) - hosted via reliable CDN */
const eatSound = new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3');
eatSound.volume = 0.38;

/* ------ Responsive canvas and grid sizing ------ */
function setupCanvas() {
  // choose display size based on available width
  const maxDisplay = Math.min(window.innerWidth * 0.86, 720); // caps
  // choose cell size to make grid comfortable
  // target cols/rows between 16..28 depending on display width
  if (maxDisplay >= 680) { cols = rows = 26; }
  else if (maxDisplay >= 560) { cols = rows = 24; }
  else if (maxDisplay >= 420) { cols = rows = 22; }
  else { cols = rows = 18; }

  // compute cell px so canvas = cols * cell fits into display
  const displaySize = Math.floor(Math.min(maxDisplay, window.innerWidth * 0.92));
  cell = Math.floor(displaySize / cols);

  // final canvas pixel size (CSS and internal)
  const cssSize = cell * cols;
  canvas.style.width = cssSize + 'px';
  canvas.style.height = cssSize + 'px';

  // set backing store size for crispness
  dpr = window.devicePixelRatio || 1;
  canvas.width = cssSize * dpr;
  canvas.height = cssSize * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // redraw if paused or not running
  draw();
}
window.addEventListener('resize', () => {
  setupCanvas();
});

/* ------ Utility helpers ------ */
function gridToPx(gx, gy) {
  return { x: gx * cell, y: gy * cell };
}

function randInt(min, max) { // inclusive min..max
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ------ Game init / reset / food placement ------ */
function placeFood() {
  // place food in a free grid cell
  const occupied = new Set(snake.map(p => `${p.x},${p.y}`));
  let attempts = 0;
  let fx, fy;
  do {
    fx = randInt(0, cols - 1);
    fy = randInt(0, rows - 1);
    attempts++;
    if (attempts > 2000) break;
  } while (occupied.has(`${fx},${fy}`));
  food = { x: fx, y: fy };
}

function resetGame() {
  // center snake
  const midX = Math.floor(cols / 2);
  const midY = Math.floor(rows / 2);
  snake = [
    { x: midX - 1, y: midY },
    { x: midX,     y: midY },
    { x: midX + 1, y: midY }
  ];
  dir = { x: 0, y: 0 };        // won't move until start pressed
  nextDir = { x: 1, y: 0 };
  score = 0;
  scoreEl.textContent = score;
  placeFood();
  draw();
}

/* ------ Start / Pause / Restart / Tick scheduler ------ */
function startGame() {
  if (running) return;
  running = true;
  paused = false;
  // if not moving yet, move right
  if (dir.x === 0 && dir.y === 0) {
    nextDir = { x: 1, y: 0 };
  }
  scheduleTick();
  updateButtons();
}

function pauseGame() {
  paused = !paused;
  updateButtons();
}

function restartGame() {
  clearTick();
  running = false;
  paused = false;
  resetGame();
  startGame();
}

function clearTick() {
  if (tickTimer) clearInterval(tickTimer);
  tickTimer = null;
}

function scheduleTick() {
  clearTick();
  // slider speed: lower value = slower; we convert to ms:
  // formula: ms = map speed(3..16) to [180..45]
  const s = Math.max(3, Math.min(16, parseInt(speedRange.value, 10)));
  speed = s;
  const ms = Math.round(210 - (s - 3) * (165 / 13)); // around 180 -> 45
  tickTimer = setInterval(gameTick, ms);
}

/* ------ Game tick (grid-based, corrected boundary) ------ */
function gameTick() {
  if (!running || paused) return;

  // apply nextDir only if not opposite to dir
  if (!(nextDir.x === -dir.x && nextDir.y === -dir.y)) {
    dir = { x: nextDir.x, y: nextDir.y };
  }

  // if not moving, skip (player hasn't started moving)
  if (dir.x === 0 && dir.y === 0) return;

  // head current
  const head = snake[snake.length - 1];
  const newHead = { x: head.x + dir.x, y: head.y + dir.y };

  // check boundary: only die when newHead is completely outside grid:
  // valid positions are 0 <= x < cols and 0 <= y < rows
  if (newHead.x < 0 || newHead.y < 0 || newHead.x >= cols || newHead.y >= rows) {
    gameOver();
    return;
  }

  // check self-collision
  for (let seg of snake) {
    if (seg.x === newHead.x && seg.y === newHead.y) {
      gameOver();
      return;
    }
  }

  // push new head
  snake.push(newHead);

  // food check
  if (food && newHead.x === food.x && newHead.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    if (soundOn) playEatSound();
    placeFood();
    // update highscore
    if (score > highscore) {
      highscore = score;
      highscoreEl.textContent = highscore;
      localStorage.setItem('snakeHigh', highscore);
    }
  } else {
    // normal move: remove tail
    snake.shift();
  }

  draw();
}

function gameOver() {
  clearTick();
  running = false;
  paused = false;
  // subtle flash then reset
  flashBoard().then(() => {
    alert(`Game Over — Score: ${score}`);
    resetGame();
    updateButtons();
  });
}

/* small flash effect */
function flashBoard() {
  return new Promise(resolve => {
    const cssSize = cell * cols;
    ctx.fillStyle = 'rgba(255,80,80,0.06)';
    ctx.fillRect(0, 0, cssSize, cssSize);
    setTimeout(() => {
      draw();
      resolve();
    }, 220);
  });
}

/* ------ Drawing (grid, snake, food, optional grid lines) ------ */
function draw() {
  const cssSize = cell * cols;
  // clear
  ctx.clearRect(0, 0, cssSize, cssSize);

  // subtle board background (glass)
  const g = ctx.createLinearGradient(0, 0, 0, cssSize);
  g.addColorStop(0, 'rgba(255,255,255,0.012)');
  g.addColorStop(1, 'rgba(0,0,0,0.06)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cssSize, cssSize);

  // optional grid
  if (gridToggle.checked) drawGrid();

  // draw food with glow
  if (food) drawFood(food);

  // draw snake (rounded rectangles)
  for (let i = 0; i < snake.length; i++) {
    drawSegment(snake[i], i === snake.length - 1);
  }
}

/* gridlines */
function drawGrid() {
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  for (let c = 0; c <= cols; c++) {
    const x = c * cell + 0.5;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, rows * cell);
  }
  for (let r = 0; r <= rows; r++) {
    const y = r * cell + 0.5;
    ctx.moveTo(0, y);
    ctx.lineTo(cols * cell, y);
  }
  ctx.stroke();
  ctx.closePath();
}

/* food */
function drawFood() {
  const { x, y } = gridToPx(food.x, food.y);
  const cx = x + cell / 2, cy = y + cell / 2;
  const r = cell * 0.38;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2);
  glow.addColorStop(0, 'rgba(255,150,50,0.95)');
  glow.addColorStop(0.45, 'rgba(255,110,40,0.7)');
  glow.addColorStop(1, 'rgba(255,110,40,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
  ctx.fill();

  // core
  ctx.fillStyle = '#ff8b3b';
  roundRect(ctx, x + cell * 0.12, y + cell * 0.12, cell * 0.76, cell * 0.76, 6);
  ctx.fill();
}

/* snake segment */
function drawSegment(p, isHead) {
  const { x, y } = gridToPx(p.x, p.y);
  ctx.beginPath();
  if (isHead) {
    const g = ctx.createLinearGradient(x, y, x + cell, y + cell);
    g.addColorStop(0, '#6ef0a1');
    g.addColorStop(1, '#00d0b3');
    ctx.fillStyle = g;
    roundRect(ctx, x + cell * 0.06, y + cell * 0.06, cell * 0.88, cell * 0.88, 6);
    ctx.fill();
    // eye
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    const ex = x + cell * 0.62;
    const ey = y + cell * 0.34;
    ctx.beginPath();
    ctx.arc(ex, ey, Math.max(1.4, cell * 0.05), 0, Math.PI * 2);
    ctx.fill();
  } else {
    const t = snake.indexOf(p) / Math.max(1, snake.length - 1);
    const c1 = `rgba(${Math.floor(20 + 150 * t)}, ${Math.floor(220 - 100 * t)}, ${Math.floor(160 - 80 * t)}, 1)`;
    const c2 = `rgba(${Math.floor(10 + 120 * t)}, ${Math.floor(150 - 60 * t)}, ${Math.floor(140 - 70 * t)}, 1)`;
    const g2 = ctx.createLinearGradient(x, y, x + cell, y + cell);
    g2.addColorStop(0, c1);
    g2.addColorStop(1, c2);
    ctx.fillStyle = g2;
    roundRect(ctx, x + cell * 0.12, y + cell * 0.12, cell * 0.76, cell * 0.76, 5);
    ctx.fill();
  }
}

/* rounded rectangle helper */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ------ Input handlers (keyboard, touch buttons, swipe) ------ */
function setNextDirection(x,y) {
  // avoid reversing directly
  if (dir.x === -x && dir.y === -y) return;
  nextDir = { x, y };
}

/* keyboard */
window.addEventListener('keydown', (e) => {
  if (e.repeat) return; // ignore held repeats for direction
  switch (e.key) {
    case 'ArrowUp': case 'w': case 'W': setNextDirection(0,-1); break;
    case 'ArrowDown': case 's': case 'S': setNextDirection(0,1); break;
    case 'ArrowLeft': case 'a': case 'A': setNextDirection(-1,0); break;
    case 'ArrowRight': case 'd': case 'D': setNextDirection(1,0); break;
    case ' ': // space -> pause toggle
      paused = !paused;
      updateButtons();
      break;
  }
});

/* touch buttons */
btnUp.addEventListener('click', () => setNextDirection(0,-1));
btnDown.addEventListener('click', () => setNextDirection(0,1));
btnLeft.addEventListener('click', () => setNextDirection(-1,0));
btnRight.addEventListener('click', () => setNextDirection(1,0));

/* swipe gestures on canvas */
let touchStartX = null, touchStartY = null;
canvas.addEventListener('touchstart', (ev) => {
  const t = ev.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
}, { passive: true });

canvas.addEventListener('touchend', (ev) => {
  if (touchStartX === null) return;
  const t = ev.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  // require minimum swipe distance
  if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
    touchStartX = null; touchStartY = null;
    return;
  }
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) setNextDirection(1,0); else setNextDirection(-1,0);
  } else {
    if (dy > 0) setNextDirection(0,1); else setNextDirection(0,-1);
  }
  touchStartX = null; touchStartY = null;
}, { passive: true });

/* ------ UI button handlers ------ */
startBtn.addEventListener('click', () => { startGame(); });
pauseBtn.addEventListener('click', () => { pauseGame(); });
restartBtn.addEventListener('click', () => { restartGame(); });
speedRange.addEventListener('input', () => { scheduleTick(); });
gridToggle.addEventListener('change', () => { draw(); });

themeBtn.addEventListener('click', () => {
  darkTheme = !darkTheme;
  if (darkTheme) {
    document.body.style.background = 'linear-gradient(270deg, #1c1c1c, #2a2a2a, #1c1c1c)';
  } else {
    document.body.style.background = 'linear-gradient(270deg, #f8efe6, #f6d9cc, #f8efe6)';
  }
});

soundBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? 'Sound' : 'Muted';
});

/* ------ sound play guard for browsers */
function playEatSound() {
  try {
    eatSound.currentTime = 0;
    eatSound.play().catch(()=>{ /* ignore autoplay blocks */ });
  } catch(e) {}
}

/* ------ helpers ------ */
function gridToPx(gx, gy) {
  return { x: gx * cell, y: gy * cell };
}

/* ------ UI state updates ------ */
function updateButtons() {
  pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  // disabled states
  startBtn.disabled = running && !paused;
  pauseBtn.disabled = !running;
  restartBtn.disabled = false;
  if (!running) pauseBtn.classList.add('ghost'); else pauseBtn.classList.remove('ghost');
  if (!running) restartBtn.classList.add('ghost'); else restartBtn.classList.remove('ghost');
}

/* ------ Startup / initial setup ------ */
function init() {
  setupCanvas();
  resetGame();
  updateButtons();

  // auto-resize canvas on load
  window.setTimeout(() => { setupCanvas(); }, 60);
}

/* init on load */
init();

/* start game on first tap/interaction for friendly UX */
canvas.addEventListener('mousedown', () => { if (!running) startGame(); }, { once:true });
canvas.addEventListener('touchstart', () => { if (!running) startGame(); }, { once:true });

/* initialize listeners for page visibility to pause/resume */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (running && !paused) { paused = true; updateButtons(); }
  }
});
