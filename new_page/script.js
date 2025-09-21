// Sidebar toggle
const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");

hamburger.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  hamburger.classList.toggle("active");
});

// Dropdown toggle
document.querySelectorAll(".dropdown-toggle").forEach(toggle => {
  toggle.addEventListener("click", () => {
    const menu = toggle.nextElementSibling;
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  });
});

// Background Themes
const backgrounds = {
  "Water Flow": "linear-gradient(270deg, #1c1c1c, #2a2a2a, #1c1c1c)",
  "Sunset Glow": "linear-gradient(270deg, #ff6a00, #ee0979, #ff6a00)",
  "Aurora Sky": "linear-gradient(270deg, #00c6ff, #0072ff, #00c6ff)",
  "Neon Night": "linear-gradient(270deg, #8e2de2, #4a00e0, #8e2de2)",
  "Dark Forest": "linear-gradient(270deg, #0f2027, #203a43, #2c5364)",
  "Galaxy": "linear-gradient(270deg, #0f0c29, #302b63, #24243e)"
};
document.querySelectorAll(".bg-option").forEach(option => {
  option.addEventListener("click", () => {
    let theme = option.textContent;
    document.body.style.background = backgrounds[theme];
    document.body.style.backgroundSize = "600% 600%";
    document.body.style.animation = "waterflow 20s ease infinite";
  });
});

// Cursor Effects
let cursorEffect = null;
document.querySelectorAll(".cursor-option").forEach(option => {
  option.addEventListener("click", () => {
    cursorEffect = option.textContent;
  });
});
document.addEventListener("mousemove", (e) => {
  if (!cursorEffect) return;
  let el;
  if (cursorEffect === "Glow Trail") {
    el = document.createElement("div");
    el.classList.add("cursor-dot");
  } else if (cursorEffect === "Stars") {
    el = document.createElement("div");
    el.classList.add("cursor-star");
  } else if (cursorEffect === "Bubbles") {
    el = document.createElement("div");
    el.classList.add("cursor-bubble");
  } else if (cursorEffect === "Fire Sparks") {
    el = document.createElement("div");
    el.classList.add("cursor-spark");
  } else if (cursorEffect === "Rainbow Tail") {
    el = document.createElement("div");
    el.classList.add("cursor-rainbow");
  }
  if (el) {
    el.style.left = `${e.pageX}px`;
    el.style.top = `${e.pageY}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
});

// Click Effects
let clickEffect = null;
document.querySelectorAll(".click-option").forEach(option => {
  option.addEventListener("click", () => {
    clickEffect = option.textContent;
  });
});
document.addEventListener("click", (e) => {
  if (!clickEffect || e.target.closest(".dropdown")) return;

  if (clickEffect === "Ripple") {
    const ripple = document.createElement("span");
    ripple.classList.add("click-ripple");
    ripple.style.left = `${e.pageX}px`;
    ripple.style.top = `${e.pageY}px`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);
  }

  if (clickEffect === "Explosion" || clickEffect === "Stars Burst") {
    for (let i = 0; i < 10; i++) {
      const particle = document.createElement("span");
      particle.classList.add("click-particle");
      particle.style.left = `${e.pageX}px`;
      particle.style.top = `${e.pageY}px`;
      document.body.appendChild(particle);

      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * 80;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      particle.animate([
        { transform: "translate(0, 0)", opacity: 1 },
        { transform: `translate(${x}px, ${y}px)`, opacity: 0 }
      ], { duration: 700, easing: "ease-out" });

      setTimeout(() => particle.remove(), 700);
    }
  }

  if (clickEffect === "Hearts") {
    const heart = document.createElement("div");
    heart.classList.add("click-heart");
    heart.textContent = "❤️";
    heart.style.left = `${e.pageX}px`;
    heart.style.top = `${e.pageY}px`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1200);
  }

  if (clickEffect === "Emoji Rain") {
    const emojis = ["😂","🔥","🌟","✨","💎"];
    const emoji = document.createElement("div");
    emoji.classList.add("click-emoji");
    emoji.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    emoji.style.left = `${e.pageX}px`;
    emoji.style.top = `${e.pageY}px`;
    document.body.appendChild(emoji);
    setTimeout(() => emoji.remove(), 1500);
  }
});