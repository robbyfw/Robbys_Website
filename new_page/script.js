// ===== SIDEBAR TOGGLE =====
const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");
hamburger.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  hamburger.classList.toggle("active");
});

// ===== DROPDOWNS =====
document.querySelectorAll(".dropdown-toggle").forEach(toggle => {
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");
    const menu = toggle.nextElementSibling;
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  });
});

// ===== BACKGROUND THEMES =====
const backgrounds = {
  "Water Flow": "linear-gradient(270deg, #1c1c1c, #2a2a2a, #1c1c1c)",
  "Sunset Glow": "linear-gradient(270deg, #ff6a00, #ee0979, #ff6a00)",
  "Aurora Sky": "linear-gradient(270deg, #00c6ff, #0072ff, #00c6ff)",
  "Neon Night": "linear-gradient(270deg, #8e2de2, #4a00e0, #8e2de2)",
  "Dark Forest": "linear-gradient(270deg, #0f2027, #203a43, #2c5364)",
  "Galaxy": "radial-gradient(circle at 20% 20%, #2b1055, #000)",
  "Matrix": "repeating-linear-gradient(#0f0, #000 20px)"
};
document.querySelectorAll(".bg-option").forEach(opt => {
  opt.addEventListener("click", () => {
    document.body.style.background = backgrounds[opt.textContent];
    document.body.style.backgroundSize = "600% 600%";
    document.body.style.animation = "waterflow 20s ease infinite";
  });
});

// ===== CURSOR EFFECTS =====
let cursorEffect = null;
document.querySelectorAll(".cursor-option").forEach(opt => {
  opt.addEventListener("click", () => { cursorEffect = opt.textContent; });
});
document.addEventListener("mousemove", e => {
  if (!cursorEffect) return;
  if (cursorEffect === "Glow Trail") {
    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    dot.style.left = e.pageX + "px";
    dot.style.top = e.pageY + "px";
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 1000);
  }
  if (cursorEffect === "Stars") {
    const star = document.createElement("div");
    star.className = "cursor-star";
    star.style.left = e.pageX + "px";
    star.style.top = e.pageY + "px";
    document.body.appendChild(star);
    setTimeout(() => star.remove(), 800);
  }
  if (cursorEffect === "Emoji 😂" || cursorEffect === "Hearts ❤️") {
    const emoji = document.createElement("div");
    emoji.className = "cursor-emoji";
    emoji.textContent = cursorEffect.includes("😂") ? "😂" : "❤️";
    emoji.style.left = e.pageX + "px";
    emoji.style.top = e.pageY + "px";
    document.body.appendChild(emoji);
    setTimeout(() => emoji.remove(), 1000);
  }
  if (cursorEffect === "Fire Sparks") {
    const spark = document.createElement("div");
    spark.className = "cursor-spark";
    spark.textContent = "✨";
    spark.style.left = e.pageX + "px";
    spark.style.top = e.pageY + "px";
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 800);
  }
});

// ===== CLICK EFFECTS =====
let clickEffect = null;
document.querySelectorAll(".click-option").forEach(opt => {
  opt.addEventListener("click", () => { clickEffect = opt.textContent; });
});
document.addEventListener("click", e => {
  if (!clickEffect) return;
  if (clickEffect === "Ripple") {
    const ripple = document.createElement("span");
    ripple.className = "click-ripple";
    ripple.style.left = e.pageX + "px";
    ripple.style.top = e.pageY + "px";
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1000);
  }
  if (clickEffect === "Explosion") {
    for (let i = 0; i < 10; i++) {
      const particle = document.createElement("span");
      particle.className = "click-particle";
      particle.style.left = e.pageX + "px";
      particle.style.top = e.pageY + "px";
      document.body.appendChild(particle);
      const angle = Math.random() * 2 * Math.PI;
      const dist = Math.random() * 80;
      particle.animate([
        { transform: "translate(0,0)", opacity: 1 },
        { transform: `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px)`, opacity: 0 }
      ], { duration: 700, easing: "ease-out" });
      setTimeout(() => particle.remove(), 700);
    }
  }
  if (clickEffect === "Fireworks") {
    for (let i = 0; i < 20; i++) {
      const fw = document.createElement("div");
      fw.className = "firework";
      fw.style.left = e.pageX + "px";
      fw.style.top = e.pageY + "px";
      document.body.appendChild(fw);
      const angle = Math.random() * 2 * Math.PI;
      const dist = Math.random() * 100;
      fw.animate([
        { transform: "translate(0,0)", opacity: 1 },
        { transform: `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px)`, opacity: 0 }
      ], { duration: 1000 });
      setTimeout(() => fw.remove(), 1000);
    }
  }
  if (clickEffect === "Confetti") {
    for (let i = 0; i < 15; i++) {
      const conf = document.createElement("div");
      conf.className = "cursor-emoji";
      conf.textContent = "🎉";
      conf.style.left = e.pageX + "px";
      conf.style.top = e.pageY + "px";
      document.body.appendChild(conf);
      const x = (Math.random() - 0.5) * 200;
      const y = Math.random() * -150;
      conf.animate([
        { transform: "translate(0,0)", opacity: 1 },
        { transform: `translate(${x}px, ${y}px)`, opacity: 0 }
      ], { duration: 1200 });
      setTimeout(() => conf.remove(), 1200);
    }
  }
});

// ===== TEXT EFFECTS =====
document.querySelectorAll(".text-option").forEach(opt => {
  opt.addEventListener("click", () => {
    const heroTitle = document.querySelector(".hero h1");
    heroTitle.className = "";
    if (opt.textContent === "Rainbow Text") heroTitle.classList.add("rainbow");
    if (opt.textContent === "Wave Text") {
      heroTitle.innerHTML = "";
      "Interactive Effects Playground".split("").forEach((ch,i) => {
        const span = document.createElement("span");
        span.textContent = ch;
        span.style.animationDelay = (i*0.1)+"s";
        heroTitle.appendChild(span);
      });
      heroTitle.classList.add("wave");
    }
    if (opt.textContent === "Glitch") heroTitle.classList.add("glitch");
  });
});

// ===== PAGE EFFECTS =====
document.querySelectorAll(".page-option").forEach(opt => {
  opt.addEventListener("click", () => {
    document.body.classList.remove("shake","pulse","spin");
    if (opt.textContent === "Shake") document.body.classList.add("shake");
    if (opt.textContent === "Pulse") document.body.classList.add("pulse");
    if (opt.textContent === "Spin") document.body.classList.add("spin");
  });
});

// ===== CLEAR EFFECTS BUTTON =====
document.getElementById("clearEffects").addEventListener("click", () => {
  document.body.removeAttribute("style");
  document.body.style.background = "linear-gradient(270deg, #1c1c1c, #2a2a2a, #1c1c1c)";
  document.body.style.backgroundSize = "600% 600%";
  document.body.style.animation = "waterflow 20s ease infinite";
  cursorEffect = null;
  clickEffect = null;
  document.querySelector(".hero h1").className = "";
  document.body.classList.remove("shake","pulse","spin");
});