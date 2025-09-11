/* Modern snake game — vanilla JS
   Controls: arrows / WASD / swipe on mobile
   Features: Start / Pause / Restart / Speed slider / Grid toggle
*/

(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d', { alpha: false });

  // UI elements
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const restartBtn = document.getElementById('restartBtn');
  const speedRange = document.getElementById('speedRange');
  const gridToggle = document.getElementById('gridToggle');
  const scoreEl = document.getElementById('score');
  const highscoreEl = document.getElementById('highscore');

  // Logical board size (grid); canvas will scale visually
  let cols = 24; // number of columns (adjusts with speed/viewport)
  let rows = 24;
  let cellSize = 32; // pixel size, actual canvas resolution will be set accordingly

  // Game state
  let snake = [];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = null;
  let score = 0;
  let highscore = parseInt(localStorage.getItem('snakeHigh') || '0', 10);
  highscoreEl.textContent = highscore;
  let running = false;
  let intervalId = null;
  let speed = parseInt(speedRange.value, 10); // frames per second-ish

  // responsive canvas resolution
  function resizeForScreen() {
    // adapt grid depending on canvas display width
    const displayWidth = canvas.clientWidth;
    // choose cell size so that board looks large on desktop and mobile
    if (displayWidth > 800) {
      cols = rows = 28;
    } else if (displayWidth > 600) {
      cols = rows = 26;
    } else if (displayWidth > 420) {
      cols = rows = 24;
    } else {
      cols = rows = 18;
    }
    // set canvas internal resolution large for crispness
    const dpr = window.devicePixelRatio || 1;
    cellSize = Math.max(14, Math.floor(displayWidth / cols));
    canvas.width = cols * cellSize * dpr;
    canvas.height = rows * cellSize * dpr;
    canvas.style.height = canvas.clientWidth + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // scale drawing to device pixel ratio
    draw(); // redraw nicely
  }
  window.addEventListener('resize', resizeForScreen);
  resizeForScreen();

  // initialize new game
  function resetGame() {
    const midX = Math.floor(cols / 2);
    const midY = Math.floor(rows / 2);
    snake = [
      { x: midX - 1, y: midY },
      { x: midX, y: midY },
      { x: midX + 1, y: midY }
    ];
    dir = { x: 0, y: 0 }; // not moving until Start pressed
    nextDir = { x: 0, y: 0 };
    score = 0;
    placeFood();
    updateScore();
    draw();
  }

  function placeFood() {
    // try to place food in a free cell
    const occupied = new Set(snake.map(p => `${p.x},${p.y}`));
    let fx, fy, tries = 0;
    do {
      fx = Math.floor(Math.random() * cols);
      fy = Math.floor(Math.random() * rows);
      tries++;
      if (tries > 1000) break;
    } while (occupied.has(`${fx},${fy}`));
    food = { x: fx, y: fy, created: Date.now() };
  }

  function updateScore() {
    scoreEl.textContent = score;
    if (score > highscore) {
      highscore = score;
      highscoreEl.textContent = highscore;
      localStorage.setItem('snakeHigh', highscore);
    }
  }

  // core game tick
  function tick() {
    // apply next dir if valid (prevent opposite turn)
    if (nextDir.x !== -dir.x || nextDir.y !== -dir.y) dir = nextDir;
    // if not moving, skip
    if (dir.x === 0 && dir.y === 0) return;

    const head = { x: snake[snake.length - 1].x + dir.x, y: snake[snake.length - 1].y + dir.y };

    // check walls (game over)
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
      gameOver();
      return;
    }

    // check collision with tail
    for (let s of snake) {
      if (s.x === head.x && s.y === head.y) {
        gameOver();
        return;
      }
    }

    // move snake
    snake.push(head);

    // check food
    if (food && head.x === food.x && head.y === food.y) {
      score += 10;
      placeFood();
      updateScore();
    } else {
      // remove tail
      snake.shift();
    }

    draw();
  }

  function gameOver() {
    pause();
    // subtle flash and reset after small delay
    flashBoard().then(() => {
      // show small animation then reset in paused state
      resetGame();
    });
  }

  function flashBoard() {
    return new Promise(res => {
      const old = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255,80,80,0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setTimeout(() => {
        // restore
        ctx.putImageData(old, 0, 0);
        res();
      }, 250);
    });
  }

  // drawing helpers
  function draw() {
    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // board background
    drawBackground();

    // optional grid
    if (gridToggle.checked) drawGrid();

    // draw food with glow
    if (food) drawFood(food);

    // draw snake with rounded segments and gradient
    drawSnake();

    // subtle border
    const pad = 0.5;
    const w = canvas.clientWidth;
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, w - pad * 2, w - pad * 2);
  }

  function drawBackground() {
    const size = cellSize * cols;
    // subtle vignette
    const g = ctx.createLinearGradient(0,0,0,size);
    g.addColorStop(0, 'rgba(255,255,255,0.012)');
    g.addColorStop(1, 'rgba(0,0,0,0.06)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,size,size);
  }

  function drawGrid() {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    for (let i = 0; i <= cols; i++) {
      ctx.moveTo(i * cellSize + 0.5, 0);
      ctx.lineTo(i * cellSize + 0.5, rows * cellSize);
    }
    for (let j = 0; j <= rows; j++) {
      ctx.moveTo(0, j * cellSize + 0.5);
      ctx.lineTo(cols * cellSize, j * cellSize + 0.5);
    }
    ctx.stroke();
  }

  function drawFood(f) {
    const cx = f.x * cellSize + cellSize / 2;
    const cy = f.y * cellSize + cellSize / 2;
    const r = cellSize * 0.36;
    // glow
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2);
    glow.addColorStop(0, 'rgba(255,160,60,0.9)');
    glow.addColorStop(0.4, 'rgba(255,120,30,0.65)');
    glow.addColorStop(1, 'rgba(255,120,30,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // core
    ctx.fillStyle = '#ff9a3c';
    roundRect(ctx, f.x * cellSize + cellSize * 0.14, f.y * cellSize + cellSize * 0.14, cellSize * 0.72, cellSize * 0.72, 8);
    ctx.fill();
  }

  function drawSnake() {
    // create gradient along snake length
    for (let i = 0; i < snake.length; i++) {
      const p = snake[i];
      const t = i / Math.max(1, snake.length - 1);
      // head brighter
      if (i === snake.length - 1) {
        // head
        drawSegment(p.x, p.y, cellSize, { head: true });
      } else {
        // body
        drawSegment(p.x, p.y, cellSize, { head: false, t });
      }
    }
  }

  function drawSegment(x, y, size, { head = false, t = 0 } = {}) {
    const px = x * size;
    const py = y * size;
    if (head) {
      // glossy head gradient
      const g = ctx.createLinearGradient(px, py, px + size, py + size);
      g.addColorStop(0, '#6ef0a1');
      g.addColorStop(1, '#00d0b3');
      ctx.fillStyle = g;
      roundRect(ctx, px + size * 0.06, py + size * 0.06, size * 0.88, size * 0.88, 6);
      ctx.fill();
      // subtle eye
      ctx.fillStyle = 'rgba(0,0,0,0.9)';
      const ex = px + size * 0.62;
      const ey = py + size * 0.35;
      ctx.beginPath();
      ctx.arc(ex, ey, Math.max(1.6, size * 0.05), 0, Math.PI * 2);
      ctx.fill();
    } else {
      // body piece color shifts from darker to lighter
      const c1 = `rgba(${Math.floor(20 + 150 * t)}, ${Math.floor(220 - 100 * t)}, ${Math.floor(160 - 80 * t)}, 1)`;
      const c2 = `rgba(${Math.floor(10 + 120 * t)}, ${Math.floor(150 - 60 * t)}, ${Math.floor(140 - 70 * t)}, 1)`;
      const g = ctx.createLinearGradient(px, py, px + size, py + size);
      g.addColorStop(0, c1);
      g.addColorStop(1, c2);
      ctx.fillStyle = g;
      roundRect(ctx, px + size * 0.12, py + size * 0.12, size * 0.76, size * 0.76, 5);
      ctx.fill();
    }
  }

  // rounded rectangle helper
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

  // controls: start, pause, restart
  function start() {
    if (running) return;
    running = true;
    dir = dir.x === 0 && dir.y === 0 ? { x: 1, y: 0 } : dir; // if not moving, start to right
    scheduleTick();
  }
  function pause() {
    running = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
  function restart() {
    pause();
    resetGame();
    start();
  }

  function scheduleTick() {
    if (intervalId) clearInterval(intervalId);
    const ms = Math.max(30, Math.round(200 - (speedRange.value * 10))); // convert slider to ms
    intervalId = setInterval(tick, ms);
  }

  // key handling
  window.addEventListener('keydown', (e) => {
    const key = e.key;
    if (['ArrowUp','w','W'].includes(key)) { setNextDir(0, -1); e.preventDefault(); }
    if (['ArrowDown','s','S'].includes(key)) { setNextDir(0, 1); e.preventDefault(); }
    if (['ArrowLeft','a','A'].includes(key)) { setNextDir(-1, 0); e.preventDefault(); }
    if (['ArrowRight','d','D'].includes(key)) { setNextDir(1, 0); e.preventDefault(); }
    if (key === ' '){ // space toggles pause
      if (running) pause(); else start();
      e.preventDefault();
    }
  });

  function setNextDir(x,y) {
    nextDir = { x, y };
  }

  // touch / swipe support (basic)
  let touchStart = null;
  canvas.addEventListener('touchstart', (ev) => {
    const t = ev.touches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  }, { passive: true });
  canvas.addEventListener('touchend', (ev) => {
    if (!touchStart) return;
    const t = ev.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
      if (Math.abs(dx) > Math.abs(dy)) {
        setNextDir(dx > 0 ? 1 : -1, 0);
      } else {
        setNextDir(0, dy > 0 ? 1 : -1);
      }
      start();
    }
    touchStart = null;
  }, { passive: true });

  // UI listeners
  startBtn.addEventListener('click', () => { start(); startBtn.blur(); });
  pauseBtn.addEventListener('click', () => { if (running) pause(); else start(); pauseBtn.blur(); });
  restartBtn.addEventListener('click', () => { restart(); restartBtn.blur(); });

  speedRange.addEventListener('input', () => {
    scheduleTick();
  });

  gridToggle.addEventListener('change', draw);

  // initialize and draw first frame
  resetGame();

  // auto-start on small interaction for a friendlier experience
  canvas.addEventListener('mousedown', () => { start(); }, { once: true });
  canvas.addEventListener('touchstart', () => { start(); }, { once: true });

})();
