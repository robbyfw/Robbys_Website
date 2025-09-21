const canvas = document.getElementById('circleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const drawSound = document.getElementById('drawSound');

// Hamburger & sidebar
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  sidebar.classList.toggle('active');
});

// Circle drawing
let startX, startY;
let isDrawing = false;
let circles = []; // store completed circles

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  drawSound.currentTime = 0;
  drawSound.play();
  startX = e.clientX;
  startY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  // Calculate radius
  const radius = Math.sqrt(Math.pow(mouseX - startX, 2) + Math.pow(mouseY - startY, 2));

  // Draw everything
  drawBackground();
  drawAllCircles();

  // Draw current circle
  ctx.beginPath();
  ctx.arc(startX, startY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 3;
  ctx.stroke();
});

canvas.addEventListener('mouseup', (e) => {
  if (!isDrawing) return;
  const mouseX = e.clientX;
  const mouseY = e.clientY;
  const radius = Math.sqrt(Math.pow(mouseX - startX, 2) + Math.pow(mouseY - startY, 2));
  circles.push({ x: startX, y: startY, radius }); // save circle
  isDrawing = false;
  drawSound.pause();
});

canvas.addEventListener('mouseleave', () => {
  isDrawing = false;
  drawSound.pause();
});

// --- Black water motion effect ---
let time = 0;
function drawBackground() {
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const data = imageData.data;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4;
      const value = Math.floor(20 + 20 * Math.sin((x+y)/50 + time));
      data[index] = value; // R
      data[index+1] = value; // G
      data[index+2] = value; // B
      data[index+3] = 255; // A
    }
  }

  ctx.putImageData(imageData, 0, 0);
  time += 0.05;
}

// Draw all saved circles
function drawAllCircles() {
  for (const c of circles) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

// Animate background continuously
function animate() {
  drawBackground();
  drawAllCircles();
  requestAnimationFrame(animate);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});