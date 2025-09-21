// ===== SIDEBAR TOGGLE =====
const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");

hamburger.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  hamburger.classList.toggle("active");
});

// ===== DROPDOWN MENUS =====
const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

dropdownToggles.forEach(toggle => {
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");
    const menu = toggle.nextElementSibling;
    if (menu.style.display === "block") {
      menu.style.display = "none";
    } else {
      menu.style.display = "block";
    }
  });
});

// ===== BACKGROUND THEMES =====
const backgrounds = {
  "Water Flow": "linear-gradient(270deg, #1c1c1c, #2a2a2a, #1c1c1c)",
  "Sunset Glow": "linear-gradient(270deg, #ff6a00, #ee0979, #ff6a00)",
  "Aurora Sky": "linear-gradient(270deg, #00c6ff, #0072ff, #00c6ff)",
  "Neon Night": "linear-gradient(270deg, #8e2de2, #4a00e0, #8e2de2)",
  "Dark Forest": "linear-gradient(270deg, #0f2027, #203a43, #2c5364)"
};

document.querySelectorAll(".bg-option").forEach(option => {
  option.addEventListener("click", () => {
    let theme = option.textContent;
    document.body.style.background = backgrounds[theme];
    document.body.style.backgroundSize = "600% 600%";
    document.body.style.animation = "waterflow 20s ease infinite";
  });
});

// ===== MOUSE CURSOR EFFECTS =====
let cursorEffect = null;
document.querySelectorAll(".cursor-option").forEach(option => {
  option.addEventListener("click", () => {
    cursorEffect = option.textContent;
  });
});

document.addEventListener("mousemove", (e) => {
  if (!cursorEffect) return;

  if (cursorEffect === "Glow Trail") {
    const dot = document.createElement("div");
    dot.classList.add("cursor-dot");
    dot.style.left = `${e.pageX}px`;
    dot.style.top = `${e.pageY}px`;
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 1000);
  }

  if (cursorEffect === "Stars") {
    const star = document.createElement("div");
    star.classList.add("cursor-star");
    star.style.left = `${e.pageX}px`;
    star.style.top = `${e.pageY}px`;
    document.body.appendChild(star);
    setTimeout(() => star.remove(), 800);
  }
});

// ===== MOUSE CLICK EFFECTS =====
let clickEffect = null;
document.querySelectorAll(".click-option").forEach(option => {
  option.addEventListener("click", () => {
    clickEffect = option.textContent;
  });
});

document.addEventListener("click", (e) => {
  if (!clickEffect) return;

  if (clickEffect === "Ripple") {
    const ripple = document.createElement("span");
    ripple.classList.add("click-ripple");
    ripple.style.left = `${e.pageX}px`;
    ripple.style.top = `${e.pageY}px`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1000);
  }

  if (clickEffect === "Explosion") {
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
      ], {
        duration: 700,
        easing: "ease-out"
      });

      setTimeout(() => particle.remove(), 700);
    }
  }
});