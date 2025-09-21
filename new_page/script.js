const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");
hamburger.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

// Background Themes
const backgrounds = document.querySelectorAll("#backgrounds span");
backgrounds.forEach(bg => {
  bg.addEventListener("click", () => {
    switch(bg.dataset.bg) {
      case "default":
        document.body.style.background = "linear-gradient(270deg, #1c1c1c, #2a2a2a, #1c1c1c)";
        break;
      case "prism":
        document.body.style.background = "linear-gradient(45deg, #ff4f4f, #4f7fff, #4fff9e)";
        break;
      case "darkveil":
        document.body.style.background = "linear-gradient(45deg, #0f0f0f, #1a1a1a, #0f0f0f)";
        break;
      case "silk":
        document.body.style.background = "linear-gradient(45deg, #f5f5f5, #c2c2c2, #f5f5f5)";
        break;
      case "aurora":
        document.body.style.background = "linear-gradient(45deg, #ff00ff, #00ffff, #ffff00)";
        break;
    }
    document.body.style.backgroundSize = "600% 600%";
    document.body.style.animation = "waterflow 20s ease infinite";
  });
});

// Text Effects
const textEffects = document.querySelectorAll("#text-effects span");
textEffects.forEach(effect => {
  effect.addEventListener("click", () => {
    const allText = document.querySelectorAll("body, body *:not(script):not(.dropbtn)");
    allText.forEach(el => {
      el.classList.remove("text-blur","text-gradient","text-glitch","text-split","text-wave");
      switch(effect.dataset.text) {
        case "blur": el.classList.add("text-blur"); break;
        case "gradient": el.classList.add("text-gradient"); break;
        case "glitch": el.classList.add("text-glitch"); break;
        case "split": 
          el.classList.add("text-split");
          el.innerHTML = el.textContent.split("").map(c => `<span>${c}</span>`).join("");
          break;
        case "wave": el.classList.add("text-wave"); break;
      }
    });
  });
});

// Clear Effects
document.getElementById("clear-effects").addEventListener("click", () => {
  const allText = document.querySelectorAll("body, body *:not(script):not(.dropbtn)");
  allText.forEach(el => {
    el.classList.remove("text-blur","text-gradient","text-glitch","text-split","text-wave");
    el.innerHTML = el.textContent; // reset split text
  });
});

// Magnetic cursor effect
let mouseX = 0, mouseY = 0;
document.addEventListener("mousemove", e => { mouseX = e.clientX; mouseY = e.clientY; });

// Add cursor trail
const trail = document.createElement("div");
trail.classList.add("cursor-trail");
trail.style.width = "15px";
trail.style.height = "15px";
document.body.appendChild(trail);
document.addEventListener("mousemove", e => {
  trail.style.left = e.clientX + "px";
  trail.style.top = e.clientY + "px";
});