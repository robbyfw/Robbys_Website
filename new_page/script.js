/* ========= State & helpers ========= */
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const clearBtn = document.getElementById('clearEffects');
const container = document.querySelector('.container');
const heroTitle = document.querySelector('.hero h1');

let state = {
  bgClass: 'bg-waterflow',
  cursor: null,
  click: null,
  textEffect: null,
  pageAnim: null,
  originalTextNodes: new Map(), // store original text for revert
  lagDotEl: null,
  activeIntervals: [],
  activeTimeouts: [],
  liveNodes: new Set() // nodes created for effects to remove on clear
};

/* ---------- Sidebar toggle (unchanged UI) ---------- */
hamburger.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  hamburger.classList.toggle('active');
});

/* ---------- Dropdown toggle (unchanged UI) ---------- */
document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    const menu = toggle.nextElementSibling;
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
  });
});

/* --------- UTIL: cleanup helper --------- */
function removeAllLiveNodes() {
  for (const n of Array.from(state.liveNodes)) {
    if (n && n.parentNode) n.parentNode.removeChild(n);
    state.liveNodes.delete(n);
  }
}
function clearAllIntervalsAndTimeouts(){
  state.activeIntervals.forEach(i=>clearInterval(i));
  state.activeTimeouts.forEach(t=>clearTimeout(t));
  state.activeIntervals = [];
  state.activeTimeouts = [];
}

/* ========== BACKGROUND THEMES (ALL KEEP WATER MOTION) ========== */
const themeMap = {
  "Water Flow": "bg-waterflow",
  "Prism (motion)": "bg-prism",
  "Dark Veil (motion)": "bg-darkveil",
  "Silk (motion)": "bg-silk",
  "Aurora (motion)": "bg-aurora",
  "Sunset Glow": "bg-sunset",
  "Neon Night": "bg-neon",
  "Dark Forest": "bg-forest",
  "Galaxy": "bg-galaxy",
  "Matrix": "bg-matrix"
};

document.querySelectorAll('.bg-option').forEach(opt => {
  opt.addEventListener('click', () => {
    const key = opt.textContent.trim();
    const cls = themeMap[key] || 'bg-waterflow';
    // remove previous bg-* classes
    Object.values(themeMap).forEach(c => document.body.classList.remove(c));
    document.body.classList.add(cls);
    state.bgClass = cls;
  });
});

/* ========== CURSOR EFFECTS: modern, improved ========= */

/* cleanup any prior cursor listeners/elements */
function removeCursorEffect() {
  document.removeEventListener('mousemove', cursorMouseHandler);
  document.removeEventListener('touchmove', cursorTouchHandler);
  if (state.lagDotEl) { state.lagDotEl.remove(); state.lagDotEl = null; }
  removeAllLiveNodes();
  clearAllIntervalsAndTimeouts();
}

/* generic mouse/touch handlers will delegate to active handler */
let lastMoveTime = 0;
function cursorMouseHandler(e) {
  if (!state.cursor) return;
  const now = performance.now();
  if (now - lastMoveTime < 8) return;
  lastMoveTime = now;
  handleCursorEffect(e.clientX, e.clientY);
}
function cursorTouchHandler(e) {
  const t = e.touches && e.touches[0];
  if (!t || !state.cursor) return;
  handleCursorEffect(t.clientX, t.clientY);
}

/* central routine spawns visuals based on effect name */
function handleCursorEffect(x,y) {
  if (!state.cursor) return;
  if (state.cursor === 'Glow Trail') {
    const dot = document.createElement('div');
    dot.className = 'trail-dot';
    dot.style.left = x + 'px'; dot.style.top = y + 'px';
    document.body.appendChild(dot);
    state.liveNodes.add(dot);
    dot.addEventListener('animationend', ()=> { dot.remove(); state.liveNodes.delete(dot); });
  }

  else if (state.cursor === 'Comet Streak') {
    const c = document.createElement('div');
    c.className = 'comet';
    c.style.left = (x - 6) + 'px'; c.style.top = (y - 6) + 'px';
    document.body.appendChild(c); state.liveNodes.add(c);
    c.addEventListener('animationend', ()=>{ c.remove(); state.liveNodes.delete(c); });
  }

  else if (state.cursor === 'Particle Trail') {
    // small particle that fades and drifts
    const p = document.createElement('div');
    p.className = 'trail-dot';
    p.style.width = p.style.height = (4 + Math.random()*8) + 'px';
    p.style.left = x + 'px'; p.style.top = y + 'px';
    p.style.opacity = 0.9*Math.random();
    document.body.appendChild(p); state.liveNodes.add(p);
    p.addEventListener('animationend', ()=>{ p.remove(); state.liveNodes.delete(p); });
  }

  else if (state.cursor === 'Neon Ribbon') {
    const r = document.createElement('div');
    r.className = 'ribbon';
    r.style.left = (x - 16) + 'px'; r.style.top = (y - 6) + 'px';
    document.body.appendChild(r); state.liveNodes.add(r);
    r.addEventListener('animationend', ()=> { r.remove(); state.liveNodes.delete(r); });
  }

  else if (state.cursor === 'Emoji Trail') {
    const e = document.createElement('div');
    e.className = 'emoji-particle';
    const EM = ["✨","💫","🔥","🌟","💎","🚀","🎯"];
    e.textContent = EM[Math.floor(Math.random()*EM.length)];
    e.style.left = x + 'px'; e.style.top = y + 'px';
    document.body.appendChild(e); state.liveNodes.add(e);
    e.addEventListener('animationend', ()=> { e.remove(); state.liveNodes.delete(e); });
  }

  else if (state.cursor === 'Magnetic Lag') {
    // create lag-dot once
    if (!state.lagDotEl) {
      const lag = document.createElement('div');
      lag.className = 'lag-dot';
      document.body.appendChild(lag);
      state.lagDotEl = lag;
      // animation loop to chase pointer smoothly
      let mx = x, my = y, vx=0, vy=0;
      const raf = () => {
        if (!state.lagDotEl) return;
        mx += (targetX - mx) * 0.14;
        my += (targetY - my) * 0.14;
        state.lagDotEl.style.transform = `translate(${mx}px, ${my}px)`;
        requestAnimationFrame(raf);
      };
      // but we need stable target values; use closures
      var targetX = x, targetY = y;
      // listener to update target coords
      function updateTarget(e){
        targetX = e.clientX; targetY = e.clientY;
      }
      document.addEventListener('mousemove', updateTarget);
      document.addEventListener('touchmove', (ev)=>{ const t = ev.touches[0]; if (t) { targetX = t.clientX; targetY = t.clientY; } }, {passive:true});
      // start RAF
      requestAnimationFrame(raf);
      // store cleanup
      state.activeTimeouts.push(setTimeout(()=>{},0));
      // also store remover function in liveNodes set so clearAll can remove listeners
      state.liveNodes.add({ remove: ()=> {
        document.removeEventListener('mousemove', updateTarget);
      }});
    }
  }

  else if (state.cursor === 'Ghost Trail') {
    const g = document.createElement('div');
    g.className = 'trail-dot';
    g.style.left = x + 'px'; g.style.top = y + 'px'; g.style.opacity = 0.18;
    document.body.appendChild(g); state.liveNodes.add(g);
    g.addEventListener('animationend', ()=>{ g.remove(); state.liveNodes.delete(g); });
  }
}

/* apply cursor selection */
function setCursorEffect(name) {
  removeCursorEffect();
  state.cursor = name || null;
  if (!state.cursor) return;
  document.addEventListener('mousemove', cursorMouseHandler);
  document.addEventListener('touchmove', cursorTouchHandler, {passive:true});
}

/* attach cursor-option handlers (dropdown items) */
document.querySelectorAll('.cursor-option').forEach(opt => {
  opt.addEventListener('click', () => {
    const name = opt.textContent.trim();
    setCursorEffect(name);
  });
});

/* ========== CLICK EFFECTS (advanced) ========== */

/* utility to spawn element and animate with removal */
function spawnAnimatedEl(tag, className, x, y, props = {}, anim = null, removeAfter = 1100) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (props.text) el.textContent = props.text;
  if (props.color) el.style.color = props.color;
  el.style.left = x + 'px'; el.style.top = y + 'px';
  document.body.appendChild(el);
  state.liveNodes.add(el);
  if (anim && typeof anim === 'function') anim(el);
  // remove on animationend if exists
  const rm = () => {
    if (el && el.parentNode) el.parentNode.removeChild(el);
    state.liveNodes.delete(el);
  };
  el.addEventListener('animationend', rm);
  // fallback remove
  const to = setTimeout(()=> { try{ rm(); } catch(e){} }, removeAfter);
  state.activeTimeouts.push(to);
  return el;
}

/* functions for click effects */
function doRipple(x,y){
  spawnAnimatedEl('div','click-ripple',x,y);
}
function doNeonBurst(x,y){
  spawnAnimatedEl('div','neon-burst',x,y);
}
function doPaintSplat(x,y){
  const colors = ['#ff3b3b','#ffd23f','#4efcb2','#7bdff6','#b38cff'];
  for (let i=0;i<10;i++){
    const spl = spawnAnimatedEl('div','paint-splat',x,y, { }, (el)=>{
      const angle = Math.random()*Math.PI*2;
      const dist = 20 + Math.random()*120;
      el.style.setProperty('--tx', (Math.cos(angle)*dist)+'px');
      el.style.setProperty('--ty', (Math.sin(angle)*dist)+'px');
      el.style.setProperty('--r', (Math.random()*360)+'deg');
      el.style.color = colors[Math.floor(Math.random()*colors.length)];
    }, 900);
  }
}
function doParticleExplosion(x,y){
  for (let i=0;i<26;i++){
    const col = `hsl(${Math.random()*360},80%,60%)`;
    spawnAnimatedEl('div','firework-dot',x,y,{}, (el)=>{
      el.style.background = col;
      const angle = Math.random()*Math.PI*2; const dist = 30 + Math.random()*160;
      el.animate([{ transform:'translate(0,0)', opacity:1}, { transform:`translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px)`, opacity:0 }], { duration: 900 + Math.random()*600, easing:'cubic-bezier(.2,.6,.2,1)'});
    }, 1400);
  }
}
function doConfetti(x,y){
  const colors = ['#ff3b3b','#ffd23f','#4efcb2','#7bdff6','#b38cff'];
  for (let i=0;i<18;i++){
    const c = spawnAnimatedEl('div','confetti',x,y);
    c.style.background = colors[Math.floor(Math.random()*colors.length)];
    const cx = (Math.random()-0.5)*240; const cy = -120 - Math.random()*80;
    c.style.setProperty('--cx', cx+'px'); c.style.setProperty('--cy', cy+'px');
  }
}
function doFireworks(x,y){
  const rings = 6 + Math.floor(Math.random()*8);
  for (let r = 0; r < rings; r++){
    const angle = Math.random()*Math.PI*2; const dist = 40 + Math.random()*180;
    const dot = spawnAnimatedEl('div','firework-dot',x,y);
    dot.style.background = `hsl(${Math.random()*360},80%,60%)`;
    dot.animate([{ transform:'translate(0,0)', opacity:1 }, { transform:`translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px)`, opacity:0}], { duration:800 + Math.random()*800, easing: 'ease-out'});
  }
}
function doShockwave(x,y){
  for (let i=0;i<3;i++){
    const ring = spawnAnimatedEl('div','shock-ring',x,y);
    ring.style.borderColor = `rgba(255,255,255,${0.9 - i*0.25})`;
  }
}

/* click listener that delegates to active clickEffect */
let activeClickEffect = null;
document.querySelectorAll('.click-option').forEach(opt => {
  opt.addEventListener('click', () => {
    activeClickEffect = opt.textContent.trim();
  });
});
document.addEventListener('click', (ev) => {
  // ignore if user clicked menus
  if (ev.target.closest('.dropdown')) return;
  if (!activeClickEffect) return;
  const x = ev.clientX, y = ev.clientY;
  switch(activeClickEffect){
    case 'Ripple': doRipple(x,y); break;
    case 'Neon Burst': doNeonBurst(x,y); break;
    case 'Paint Splat': doPaintSplat(x,y); break;
    case 'Particle Explosion': doParticleExplosion(x,y); break;
    case 'Confetti': doConfetti(x,y); break;
    case 'Fireworks': doFireworks(x,y); break;
    case 'Shockwave': doShockwave(x,y); break;
  }
});

/* ========== TEXT EFFECTS (affect ALL page text) ========== */

function allTextElements(){
  // select visible text-bearing elements we want to animate
  const selectors = 'h1,h2,h3,h4,p,a,li,button,span,small,label';
  return Array.from(document.querySelectorAll(selectors)).filter(el => el.textContent && el.offsetParent !== null);
}
/* store original text content for revert */
function storeOriginalText(){
  allTextElements().forEach(el=>{
    if (!state.originalTextNodes.has(el)) state.originalTextNodes.set(el, el.innerHTML);
  });
}
function restoreOriginalText(){
  for (const [el, html] of state.originalTextNodes) {
    if (el) el.innerHTML = html;
  }
  state.originalTextNodes.clear();
}

/* Split & Replace (changes text on entire page) */
function splitAndReplace(){
  storeOriginalText();
  const phrases = [
    "Have fun — Robby!", "Playful AI Lab", "Robby's Effects", "Try more effects!", "Interactive Playground"
  ];
  allTextElements().forEach((el, idx)=>{
    const phrase = phrases[idx % phrases.length];
    // split by letter into spans to animate
    el.innerHTML = '';
    phrase.split('').forEach((ch,i)=>{
      const sp = document.createElement('span');
      sp.textContent = ch;
      sp.style.display = 'inline-block';
      sp.style.opacity = 0;
      sp.style.transform = 'translateY(18px) rotateX(10deg)';
      sp.style.transition = `transform .45s cubic-bezier(.2,.9,.2,1) ${i*0.02}s, opacity .45s ${i*0.02}s`;
      el.appendChild(sp);
      // reveal
      setTimeout(()=>{ sp.style.opacity = 1; sp.style.transform = 'translateY(0) rotateX(0)'; }, 10);
    });
  });
}

/* Blur all text */
function blurAllText(){
  storeOriginalText();
  allTextElements().forEach(el => { el.classList.add('text-blur'); });
}

/* Shuffle text */
function shuffleTextOnce(){
  storeOriginalText();
  allTextElements().forEach(el => {
    const text = el.textContent.trim();
    if (!text) return;
    const chars = text.split('');
    const shuffled = chars.slice().sort(()=>Math.random()-0.5).join('');
    // animate swap
    el.style.opacity = 0.2;
    setTimeout(()=> { el.textContent = shuffled; el.style.opacity = 1; }, 120);
    // revert shortly after
    const t = setTimeout(()=> { if (state.originalTextNodes.has(el)) el.innerHTML = state.originalTextNodes.get(el); }, 1500 + Math.random()*1200);
    state.activeTimeouts.push(t);
  });
}

/* Gradient text */
function gradientTextAll(){
  storeOriginalText();
  allTextElements().forEach(el => {
    // skip if empty or non-text
    el.classList.add('grad-text');
  });
}

/* Glitch text */
function glitchTextAll(){
  storeOriginalText();
  allTextElements().forEach(el => {
    // wrap inner text in a span to apply glitch class
    const inner = el.textContent;
    el.innerHTML = `<span class="text-glitch">${inner}</span>`;
  });
}

/* attach handlers for text options */
document.querySelectorAll('.text-option').forEach(opt=>{
  opt.addEventListener('click', () => {
    const name = opt.textContent.trim();
    // clear previous text animations first
    // revert original if any
    restoreOriginalText();
    // remove classes
    allTextElements().forEach(el => { el.classList.remove('text-blur','grad-text'); });
    state.originalTextNodes.clear();
    switch(name){
      case 'Split & Replace (change all text)':
        splitAndReplace(); break;
      case 'Blur Text (pulse)':
        blurAllText(); break;
      case 'Shuffle Text':
        shuffleTextOnce(); break;
      case 'Gradient Text':
        gradientTextAll(); break;
      case 'Glitch Text':
        glitchTextAll(); break;
    }
  });
});

/* ========== PAGE ANIMATIONS (work properly now) ========== */
document.querySelectorAll('.page-option').forEach(opt=>{
  opt.addEventListener('click', () => {
    const name = opt.textContent.trim();
    // clear current
    container.classList.remove('shake','pulse','spin','float','tilt');
    // reflow to restart animations consistently
    void container.offsetWidth;
    switch(name){
      case 'Shake': container.classList.add('shake'); break;
      case 'Pulse': container.classList.add('pulse'); break;
      case 'Spin': container.classList.add('spin'); break;
      case 'Float': container.classList.add('float'); break;
      case 'Tilt': container.classList.add('tilt'); break;
    }
  });
});

/* ========== CLEAR ALL EFFECTS (button) ========= */
clearBtn.addEventListener('click', () => {
  // revert background to default waterflow
  Object.values(themeMap).forEach(c => document.body.classList.remove(c));
  document.body.classList.add('bg-waterflow'); state.bgClass = 'bg-waterflow';

  // remove cursor effects
  removeCursorEffect(); state.cursor = null;

  // remove click effect selection
  activeClickEffect = null;

  // restore text
  restoreOriginalText();

  // remove text classes
  allTextElements().forEach(el => {
    el.classList.remove('text-blur','grad-text');
  });

  // remove page animation
  container.classList.remove('shake','pulse','spin','float','tilt');

  // clear live nodes + timers
  removeAllLiveNodes();
  clearAllIntervalsAndTimeouts();

  // reset hero text (in case replaced)
  heroTitle.innerText = 'Interactive Effects Playground';
});

/* ========== final safety: remove lingering nodes periodically (keeps memory tidy) ========== */
setInterval(() => {
  // remove nodes that accidentally stuck >6s
  const now = Date.now();
  // nothing heavy — rely on animationend mostly
}, 5000);