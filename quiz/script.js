// script.js — improved visuals, select blur fix, keyboard and sounds

/* ---------------- Elements ---------------- */
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const quizArea = document.getElementById('quizArea');
const questionText = document.getElementById('questionText');
const optionsList = document.getElementById('optionsList');
const qNumberEl = document.getElementById('qNumber');
const qTotalEl = document.getElementById('qTotal');
const progressFill = document.getElementById('progressFill');
const scoreDisplay = document.getElementById('scoreDisplay');
const bestScoreEl = document.getElementById('bestScore');
const timerEl = document.getElementById('timer');
const nextBtn = document.getElementById('nextBtn');
const skipBtn = document.getElementById('skipBtn');
const resultArea = document.getElementById('resultArea');
const finalScoreEl = document.getElementById('finalScore');
const finalSummary = document.getElementById('finalSummary');
const playAgainBtn = document.getElementById('playAgainBtn');
const viewAnswersBtn = document.getElementById('viewAnswersBtn');

const categorySelect = document.getElementById('category');
const difficultySelect = document.getElementById('difficulty');
const amountSelect = document.getElementById('amount');

const confettiCanvas = document.getElementById('confetti-canvas');
const ctxConfetti = confettiCanvas.getContext('2d');

/* ---------------- State ---------------- */
let questions = [];
let currentIndex = 0;
let score = 0;
let timerInterval = null;
let timePerQuestion = 15;
let timeLeft = timePerQuestion;
let userAnswers = [];
let confettiPieces = [];
let confettiRunning = false;

/* ---------------- Helpers ---------------- */
function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}
function shuffleArray(arr) {
  for (let i = arr.length -1; i>0; i--) {
    const j = Math.floor(Math.random()* (i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ---------------- Sound (WebAudio) ---------------- */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(type = 'correct') {
  // simple short sound: different patterns for correct/wrong
  const now = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type === 'correct' ? 'triangle' : 'sawtooth';
  if (type === 'correct') {
    o.frequency.setValueAtTime(880, now);
    o.frequency.exponentialRampToValueAtTime(1320, now + 0.09);
  } else {
    o.frequency.setValueAtTime(220, now);
    o.frequency.exponentialRampToValueAtTime(150, now + 0.12);
  }
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.15, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start(now);
  o.stop(now + 0.24);
}

/* ---------------- API Fetch ---------------- */
async function fetchQuestions() {
  const amount = amountSelect.value || '10';
  const category = categorySelect.value || '9';
  const difficulty = difficultySelect.value || 'easy';
  const url = `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=multiple`;

  try {
    startBtn.disabled = true;
    startBtn.textContent = 'Loading...';
    const res = await fetch(url);
    const data = await res.json();
    if (data.response_code !== 0 || !data.results || data.results.length === 0) {
      alert('No questions found — try another combination.');
      startBtn.disabled = false;
      startBtn.textContent = 'Start';
      return;
    }
    questions = data.results.map(q => ({
      question: decodeHTML(q.question),
      correct: decodeHTML(q.correct_answer),
      incorrect: q.incorrect_answers.map(a => decodeHTML(a)),
      difficulty: q.difficulty,
      category: q.category
    }));
    initQuiz();
  } catch (err) {
    console.error(err);
    alert('Failed to fetch questions. Check your connection.');
    startBtn.disabled = false;
    startBtn.textContent = 'Start';
  }
}

/* ---------------- Init ---------------- */
function initQuiz() {
  currentIndex = 0;
  score = 0;
  userAnswers = [];
  scoreDisplay.textContent = score;
  qTotalEl.textContent = questions.length;
  qNumberEl.textContent = 0;
  updateProgress();
  quizArea.classList.remove('hidden');
  resultArea.classList.add('hidden');
  restartBtn.classList.remove('hidden');
  startBtn.classList.add('hidden');
  renderQuestion();
  loadBest();
}

/* ---------------- Render ---------------- */
function renderQuestion() {
  const q = questions[currentIndex];
  qNumberEl.textContent = currentIndex + 1;
  questionText.innerHTML = q.question; // question already decoded

  const opts = shuffleArray([q.correct, ...q.incorrect]);
  optionsList.innerHTML = '';
  opts.forEach((opt, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.setAttribute('type', 'button');
    btn.setAttribute('data-index', i);
    // Use innerHTML so punctuation/quotes show correctly (already decoded)
    btn.innerHTML = opt;
    // add hint number for keyboard
    const hint = document.createElement('span');
    hint.style.float = 'right';
    hint.style.opacity = '0.6';
    hint.style.fontSize = '12px';
    hint.textContent = `(${i+1})`;
    btn.appendChild(hint);

    btn.addEventListener('click', () => handleAnswer(btn, opt, q.correct));
    li.appendChild(btn);
    optionsList.appendChild(li);
  });

  nextBtn.classList.add('hidden');
  skipBtn.disabled = false;
  enableOptionButtons(true);
  resetTimer();
  startTimer();
  updateProgress();
}

/* ---------------- Progress ---------------- */
function updateProgress() {
  const pct = Math.round(((currentIndex) / Math.max(1, questions.length)) * 100);
  progressFill.style.width = `${pct}%`;
}

/* ---------------- Timer ---------------- */
function startTimer() {
  clearInterval(timerInterval);
  timeLeft = timePerQuestion;
  timerEl.textContent = formatTime(timeLeft);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = formatTime(timeLeft);
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 1000);
}
function resetTimer() {
  clearInterval(timerInterval);
  timerEl.textContent = formatTime(timePerQuestion);
}
function formatTime(sec) {
  const s = String(sec).padStart(2, '0');
  return `00:${s}`;
}

/* ---------------- Answer handling ---------------- */
function handleAnswer(btn, chosen, correct) {
  if (btn.disabled) return;
  enableOptionButtons(false);
  clearInterval(timerInterval);
  skipBtn.disabled = true;

  const allOptionButtons = optionsList.querySelectorAll('button');
  allOptionButtons.forEach(b => {
    if (b.textContent.replace(/\(\d\)$/, '').trim() === correct) {
      b.classList.add('correct');
    }
    b.disabled = true;
  });

  if (chosen === correct) {
    btn.classList.add('correct');
    // sound
    playTone('correct');
    score += 1;
    scoreDisplay.textContent = score;
    userAnswers.push({ question: questions[currentIndex], chosen, correct, ok: true });
  } else {
    btn.classList.add('wrong');
    playTone('wrong');
    userAnswers.push({ question: questions[currentIndex], chosen, correct, ok: false });
  }

  nextBtn.classList.remove('hidden');
  nextBtn.textContent = (currentIndex === questions.length - 1) ? 'Finish' : 'Next';
  saveBestIfNeeded();
}

function handleTimeout() {
  enableOptionButtons(false);
  skipBtn.disabled = true;

  const allOptionButtons = optionsList.querySelectorAll('button');
  allOptionButtons.forEach(b => {
    if (b.textContent.replace(/\(\d\)$/, '').trim() === questions[currentIndex].correct) {
      b.classList.add('correct');
    } else {
      b.classList.add('wrong');
    }
    b.disabled = true;
  });

  userAnswers.push({ question: questions[currentIndex], chosen: null, correct: questions[currentIndex].correct, ok: false });
  nextBtn.classList.remove('hidden');
  nextBtn.textContent = (currentIndex === questions.length - 1) ? 'Finish' : 'Next';
}

/* ---------------- Navigation ---------------- */
nextBtn.addEventListener('click', () => {
  currentIndex++;
  if (currentIndex >= questions.length) {
    finishQuiz();
  } else {
    renderQuestion();
  }
});

skipBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  handleTimeout();
});

restartBtn.addEventListener('click', () => location.reload());

playAgainBtn.addEventListener('click', () => {
  resultArea.classList.add('hidden');
  quizArea.classList.remove('hidden');
  currentIndex = 0;
  score = 0;
  userAnswers = [];
  scoreDisplay.textContent = 0;
  renderQuestion();
});

viewAnswersBtn.addEventListener('click', () => {
  // build review string
  let html = '';
  userAnswers.forEach((ua, idx) => {
    html += `${idx+1}. ${ua.question.question}\nYour answer: ${ua.chosen ?? '(no answer)'}\nCorrect: ${ua.correct}\n\n`;
  });
  // simple popup (keeps it quick)
  alert(html || 'No answers yet.');
});

/* ---------------- Finish ---------------- */
function finishQuiz() {
  clearInterval(timerInterval);
  quizArea.classList.add('hidden');
  resultArea.classList.remove('hidden');
  finalScoreEl.textContent = score;
  const pct = Math.round((score / questions.length) * 100);
  finalSummary.innerHTML = `You answered <strong>${score}</strong> / <strong>${questions.length}</strong> correctly. (${pct}%)`;

  if (pct >= 70) runConfetti(120);
  saveBestIfNeeded();
}

/* ---------------- Option enable/disable ---------------- */
function enableOptionButtons(enable) {
  const btns = optionsList.querySelectorAll('button');
  btns.forEach(b => b.disabled = !enable);
}

/* ---------------- Best score (localStorage) ---------------- */
function loadBest() {
  const prev = Number(localStorage.getItem('quiz_best') || 0);
  bestScoreEl.textContent = prev;
}
function saveBestIfNeeded() {
  const prev = Number(localStorage.getItem('quiz_best') || 0);
  if (score > prev) {
    localStorage.setItem('quiz_best', String(score));
    bestScoreEl.textContent = score;
  }
}

/* ---------------- Confetti ---------------- */
function resizeConfetti() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfetti);
resizeConfetti();

function runConfetti(amount = 80) {
  if (confettiRunning) return;
  confettiRunning = true;
  confettiPieces = [];
  for (let i = 0; i < amount; i++) {
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * -confettiCanvas.height,
      w: 6 + Math.random() * 12,
      h: 8 + Math.random() * 16,
      vx: -2 + Math.random() * 4,
      vy: 2 + Math.random() * 6,
      angle: Math.random() * 360,
      color: `hsl(${Math.floor(Math.random() * 360)}, 75%, 60%)`,
      rotSpeed: -0.12 + Math.random() * 0.24
    });
  }

  const start = performance.now();
  const lifetime = 2400;

  function step(now) {
    const elapsed = now - start;
    ctxConfetti.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
    confettiPieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03;
      p.angle += p.rotSpeed;

      ctxConfetti.save();
      ctxConfetti.translate(p.x, p.y);
      ctxConfetti.rotate(p.angle);
      ctxConfetti.fillStyle = p.color;
      ctxConfetti.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctxConfetti.restore();
    });

    if (elapsed < lifetime) {
      requestAnimationFrame(step);
    } else {
      ctxConfetti.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
      confettiRunning = false;
    }
  }

  requestAnimationFrame(step);
}

/* ---------------- Keyboard shortcuts 1-4 ---------------- */
window.addEventListener('keydown', (e) => {
  if (quizArea.classList.contains('hidden')) return;
  const key = e.key;
  if (['1','2','3','4'].includes(key)) {
    const idx = Number(key) - 1;
    const btn = optionsList.querySelector(`button[data-index="${idx}"]`);
    if (btn && !btn.disabled) btn.click();
  } else if (key === 'Enter' && !nextBtn.classList.contains('hidden')) {
    nextBtn.click();
  }
});

/* ---------------- Start handler ---------------- */
startBtn.addEventListener('click', async () => {
  await fetchQuestions();
});

/* ---------------- On load show best ---------------- */
loadBest();
