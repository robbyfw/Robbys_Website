// Mouse Parallax for background
const parallaxBg = document.getElementById('parallax-bg');
document.addEventListener('mousemove', e => {
  const x = e.clientX / window.innerWidth;
  const y = e.clientY / window.innerHeight;
  parallaxBg.style.backgroundPosition = `${40 + x*20}% ${30 + y*20}%, ${70 - x*10}% ${70 - y*10}%`;
});

// Sound effect for button hover (replace 'click.mp3' with your own sound file)
const soundBtn = document.getElementById('sound-btn');
const buttonAudio = document.getElementById('button-audio');
soundBtn.addEventListener('mouseenter', () => {
  buttonAudio.currentTime = 0;
  buttonAudio.play();
});

// 3D card mouse animation (tilt based on mouse position)
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const dx = (x - xc) / xc;
    const dy = (y - yc) / yc;
    card.style.transform = `rotateY(${18 * dx}deg) rotateX(${-8 * dy}deg) scale(1.06)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// Animated gradient background
let gradPos = 0;
setInterval(() => {
  gradPos += 1;
  document.body.style.background = 
    `linear-gradient(${120 + gradPos%120}deg, #1f1c2c 0%, #928dab 100%)`;
}, 80);