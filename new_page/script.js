// ===== Sidebar =====
const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");
hamburger.addEventListener("click", () => sidebar.classList.toggle("open"));

// ===== Dropdowns =====
document.querySelectorAll(".dropdown-toggle").forEach(toggle => {
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");
    let menu = toggle.nextElementSibling;
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
  });
});

// ===== Background Themes =====
const backgrounds = {
  "Water Flow": "linear-gradient(270deg, #1c1c1c, #2a2a2a, #1c1c1c)",
  "Sunset Glow": "linear-gradient(270deg, #ff6a00, #ee0979, #ff6a00)",
  "Aurora Sky": "linear-gradient(270deg, #00c6ff, #0072ff, #00c6ff)",
  "Neon Night": "linear-gradient(270deg, #8e2de2, #4a00e0, #8e2de2)",
  "Dark Forest": "linear-gradient(270deg, #0f2027, #203a43, #2c5364)",
  "Matrix Rain": "black",
  "Space Warp": "radial-gradient(circle, #000, #111, #000)"
};
document.querySelectorAll(".bg-option").forEach(option => {
  option.addEventListener("click", () => {
    let theme = option.textContent;
    document.body.style.background = backgrounds[theme];
    document.body.style.backgroundSize = "600% 600%";
    document.body.style.animation = "waterflow 20s ease infinite";
  });
});

// ===== Cursor Effects =====
let cursorEffect = null;
document.querySelectorAll(".cursor-option").forEach(option => {
  option.addEventListener("click", () => cursorEffect = option.textContent);
});
document.addEventListener("mousemove", e => {
  if (!cursorEffect) return;
  let dot;
  if (cursorEffect === "Glow Trail") dot = createCursor("cursor-dot", e);
  if (cursorEffect === "Stars") dot = createCursor("cursor-star", e);
  if (cursorEffect === "Rainbow Trail") dot = createCursor("cursor-rainbow", e);
  if (cursorEffect === "Sparkles") dot = createCursor("cursor-spark", e);
  if (cursorEffect === "Ghost Trail") dot = createCursor("cursor-dot", e, "rgba(255,255,255,0.3)");
  if (dot) setTimeout(() => dot.remove(), 1000);
});
function createCursor(cls, e, color) {
  const el = document.createElement("div");
  el.className = cls;
  el.style.left = e.pageX + "px";
  el.style.top = e.pageY + "px";
  if (color) el.style.background = color;
  document.body.appendChild(el);
  return el;
}

// ===== Click Effects =====
let clickEffect = null;
document.querySelectorAll(".click-option").forEach(option => {
  option.addEventListener("click", () => clickEffect = option.textContent);
});
document.addEventListener("click", e => {
  if (!clickEffect) return;
  if (clickEffect === "Ripple") ripple(e);
  if (clickEffect === "Explosion") explosion(e);
  if (clickEffect === "Hearts") hearts(e);
  if (clickEffect === "Confetti") confetti(e);
  if (clickEffect === "Fireworks") fireworks(e);
});
function ripple(e) {
  const r = document.createElement("span");
  r.className = "click-ripple";
  r.style.left = e.pageX + "px";
  r.style.top = e.pageY + "px";
  r.style.width = r.style.height = "50px";
  document.body.appendChild(r);
  setTimeout(() => r.remove(), 800);
}
function explosion(e) {
  for (let i=0;i<10;i++) particle(e,"click-particle","cyan");
}
function hearts(e) {
  for (let i=0;i<5;i++) particle(e,"click-heart","pink","❤️");
}
function confetti(e) {
  for (let i=0;i<15;i++) particle(e,"click-confetti",randomColor());
}
function fireworks(e) {
  for (let i=0;i<20;i++) particle(e,"click-firework",randomColor());
}
function particle(e,cls,color,char) {
  const p=document.createElement("span");
  p.className=cls; p.style.left=e.pageX+"px"; p.style.top=e.pageY+"px";
  p.style.background=color||"white"; if(char) p.textContent=char;
  document.body.appendChild(p);
  const a=Math.random()*2*Math.PI; const d=Math.random()*80;
  const x=Math.cos(a)*d, y=Math.sin(a)*d;
  p.animate([{transform:"translate(0,0)",opacity:1},{transform:`translate(${x}px,${y}px)`,opacity:0}],{duration:700});
  setTimeout(()=>p.remove(),700);
}
function randomColor(){return `hsl(${Math.random()*360},100%,50%)`;}

// ===== Text Effects =====
let textEffect = null;
const mainTitle = document.querySelector("main h1");
document.querySelectorAll(".textfx-option").forEach(opt=>{
  opt.addEventListener("click",()=>{
    textEffect = opt.textContent;
    mainTitle.className="";
    if(textEffect==="Typewriter") mainTitle.classList.add("typewriter");
    if(textEffect==="Glitch") mainTitle.classList.add("glitch");
    if(textEffect==="Neon Glow") mainTitle.classList.add("neon");
    if(textEffect==="Rainbow Text") mainTitle.classList.add("rainbow-text");
    if(textEffect==="Wavy") {
      mainTitle.innerHTML = mainTitle.textContent.split("").map(ch=>`<span>${ch}</span>`).join("");
      mainTitle.classList.add("wavy");
    }
  });
});

// ===== Clear Effects =====
document.getElementById("clear-effects").addEventListener("click",()=>{
  document.body.style.background="black";
  document.body.style.animation="none";
  cursorEffect=null; clickEffect=null; textEffect=null;
  mainTitle.className=""; mainTitle.textContent="Welcome to the Effects Playground 🎉";
});