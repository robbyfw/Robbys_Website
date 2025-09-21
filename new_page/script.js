function toggleSidebar() {
  let sidebar = document.getElementById("sidebar");
  sidebar.style.width = sidebar.style.width === "250px" ? "0" : "250px";
}

function showEffect(effect) {
  let area = document.getElementById("effectArea");
  area.innerHTML = "";

  switch (effect) {
    case "particles":
      area.innerHTML = `<canvas id="particleCanvas"></canvas>`;
      particleEffect();
      break;

    case "neon":
      area.innerHTML = `<h1 class="neon">Neon Lights ✨</h1>`;
      break;

    case "bouncing":
      area.innerHTML = `<canvas id="ballCanvas"></canvas>`;
      bouncingBalls();
      break;

    case "matrix":
      area.innerHTML = `<canvas id="matrixCanvas"></canvas>`;
      matrixRain();
      break;

    case "typewriter":
      area.innerHTML = `<div class="typewriter">This is a typewriter effect!</div>`;
      break;

    case "cube":
      area.innerHTML = `
        <div class="cube">
          <div></div><div></div><div></div>
          <div></div><div></div><div></div>
        </div>`;
      break;

    case "ripple":
      area.innerHTML = `<p>Click anywhere for ripple effect 💧</p>`;
      rippleEffect();
      break;

    case "glow":
      area.innerHTML = `
        <button class="glow-btn">Click Me</button>
        <button class="glow-btn">Or Me</button>
      `;
      break;

    case "quotes":
      let quotes = [
        "The best way to predict the future is to invent it.",
        "Stay hungry, stay foolish.",
        "Code is like humor. When you have to explain it, it’s bad.",
        "Simplicity is the soul of efficiency."
      ];
      let random = quotes[Math.floor(Math.random() * quotes.length)];
      area.innerHTML = `<h2>"${random}"</h2>`;
      break;
  }
}

// === EFFECTS ===

// Particles
function particleEffect() {
  const canvas = document.getElementById("particleCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth * 0.7;
  canvas.height = 400;
  let particles = [];

  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
      size: 3
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });
    requestAnimationFrame(animate);
  }
  animate();
}

// Bouncing Balls
function bouncingBalls() {
  const canvas = document.getElementById("ballCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth * 0.7;
  canvas.height = 400;

  let balls = Array.from({ length: 10 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    dx: (Math.random() - 0.5) * 4,
    dy: (Math.random() - 0.5) * 4,
    r: 20
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    balls.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = "cyan";
      ctx.fill();
      b.x += b.dx; b.y += b.dy;
      if (b.x < b.r || b.x > canvas.width - b.r) b.dx *= -1;
      if (b.y < b.r || b.y > canvas.height - b.r) b.dy *= -1;
    });
    requestAnimationFrame(animate);
  }
  animate();
}

// Matrix Rain
function matrixRain() {
  const canvas = document.getElementById("matrixCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth * 0.7;
  canvas.height = 400;

  const letters = "01";
  const fontSize = 14;
  const columns = canvas.width / fontSize;
  const drops = Array(Math.floor(columns)).fill(1);

  function draw() {
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "lime";
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
      const text = letters.charAt(Math.floor(Math.random() * letters.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  setInterval(draw, 50);
}

// Ripple Click
function rippleEffect() {
  document.getElementById("effectArea").onclick = function(e) {
    let ripple = document.createElement("span");
    ripple.classList.add("ripple");
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1000);
  };
}