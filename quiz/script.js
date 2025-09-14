// script.js — connected to index.html
// Quiz using OpenTDB and improved UX

// Elements
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

const confettiCanvas = document.getElementById('confetti-canvas');
const ctxConfetti = confettiCanvas.getContext('2d');

// Controls
const categorySelect = document.getElementById('category');
const difficultySelect = document.getElementById('difficulty');
const amountSelect = document.getElementById('amount');

let questions = [];
let currentIndex = 0;
let score = 0;
let timerInterval = null;
let timePerQuestion = 15; // seconds
let timeLeft = timePerQuestion;
let userAnswers = []; // store for review

// confetti globals
let confettiPieces = [];
let confettiRunning = false;

/* ---------- Helpers ---------- */
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

/* ---------- API Fetch ---------- */
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

/* ---------- Init / UI ---------- */
function initQuiz() {
  // reset
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
  saveBestFromStorage();
}

function renderQuestion() {
  const q = questions[currentIndex];
  qNumberEl.textContent = currentIndex + 1;
  questionText.textContent = q.question;

  // build options
  const opts = shuffleArray([q.correct, ...q.incorrect]);
  optionsList.innerHTML = '';
  opts.forEach(opt => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.setAttribute('type', 'button');
    btn.textContent = opt;
    btn.addEventListener('click', () => handleAnswer(btn, opt, q.correct));
    li.appendChild(btn);
    optionsList.appendChild(li);
  });

  // reset next/skip/timer
  nextBtn.classList.add('hidden');
  skipBtn.disabled = false;
  enableOptionButtons(true);
  resetTimer();
  startTimer();

  updateProgress();
}

/* ---------- Progress ---------- */
function updateProgress() {
  const pct = ((currentIndex) / Math.max(1, questions.length)) * 100;
  progressFill.style.width = `${pct}%`;
}

/* ---------- Timer ---------- */
function startTimer() {
  clearInterval(timerInterval);
  timeLeft = timePerQuestion;
  timerEl.textContent = formatTime(timeLeft);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = formatTime(timeLeft);
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      // treat as skipped/incorrect
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

/* ---------- Answer handling ---------- */
function handleAnswer(btn, chosen, correct) {
  // Prevent double clicks
  enableOptionButtons(false);
  clearInterval(timerInterval);
  skipBtn.disabled = true;

  const allOptionButtons = optionsList.querySelectorAll('button');
  // reveal correct answer
  allOptionButtons.forEach(b => {
    if (b.textContent === correct) {
      b.classList.add('correct');
    }
    b.disabled = true;
  });

  if (chosen === correct) {
    btn.classList.add('correct');
    score += 1;
    scoreDisplay.textContent = score;
    userAnswers.push({ question: questions[currentIndex], chosen, correct, correctFlag: true });
  } else {
    btn.classList.add('wrong');
    userAnswers.push({ question: questions[currentIndex], chosen, correct, correctFlag: false });
  }

  // Show next button or finish
  nextBtn.classList.remove('hidden');

  // Save to localStorage best
  setTimeout(saveBestToStorage, 300);

  // If last question, change next button text
  if (currentIndex === questions.length - 1) {
    nextBtn.textContent = 'Finish';
  } else {
    nextBtn.textContent = 'Next';
  }
}

function handleTimeout() {
  // mark as missed
  enableOptionButtons(false);
  skipBtn.disabled = true;

  // highlight correct
  const allOptionButtons = optionsList.querySelectorAll('button');
  allOptionButtons.forEach(b => {
    if (b.textContent === questions[currentIndex].correct) {
      b.classList.add('correct');
    } else {
      b.classList.add('wrong');
    }
    b.disabled = true;
  });

  userAnswers.push({ question: questions[currentIndex], chosen: null, correct: questions[currentIndex].correct, correctFlag: false });
  nextBtn.classList.remove('hidden');
  nextBtn.textContent = (currentIndex === questions.length - 1) ? 'Finish' : 'Next';
}

/* ---------- Navigation ---------- */
nextBtn.addEventListener('click', () => {
  // move forward
  currentIndex++;
  if (currentIndex >= questions.length) {
    finishQuiz();
  } else {
    renderQuestion();
  }
});

skipBtn.addEventListener('click', () => {
  // mark skip
  clearInterval(timerInterval);
  handleTimeout();
  // allow next
});

restartBtn.addEventListener('click', () => {
  window.location.reload();
});

playAgainBtn.addEventListener('click', () => {
  // restart the same quiz settings
  resultArea.classList.add('hidden');
  quizArea.classList.remove('hidden');
  currentIndex = 0;
  score = 0;
  userAnswers = [];
  scoreDisplay.textContent = 0;
  renderQuestion();
});

viewAnswersBtn.addEventListener('click', () => {
  // show review: iterate through userAnswers and show a simple summary
  let html = '';
  userAnswers.forEach((ua, idx) => {
    html += `${idx+1}. ${ua.question.question}<br>`;
    html += `&nbsp;&nbsp;Your answer: <strong>${ua.chosen ?? '(no answer)'}</strong><br>`;
    html += `&nbsp;&nbsp;Correct: <strong>${ua.correct}</strong><br><br>`;
  });
  alert(html);
});

/* ---------- Finish ---------- */
function finishQuiz() {
  clearInterval(timerInterval);
  quizArea.classList.add('hidden');
  resultArea.classList.remove('hidden');
  finalScoreEl.textContent = score;
  const pct = Math.round((score / questions.length) * 100);
  finalSummary.innerHTML = `You answered <strong>${score}</strong> / <strong>${questions.length}</strong> correctly. (${pct}%)`;

  // confetti if >= 70%
  if (pct >= 70) runConfetti(120);

  // save best
  saveBestToStorage();
}

/* ---------- Option enabling ---------- */
function enableOptionButtons(enable) {
  const btns = optionsList.querySelectorAll('button');
  btns.forEach(b => {
    b.disabled = !enable;
  });
}

/* ---------- Score persistence ---------- */
function saveBestToStorage() {
  const prevBest = Number(localStorage.getItem('quiz_best') || 0);
  if (score > prevBest) {
    localStorage.setItem('quiz_best', String(score));
    bestScoreEl.textContent = score;
  } else {
    bestScoreEl.textContent = prevBest;
  }
}
function saveBestFromStorage() {
  const prevBest = Number(localStorage.getItem('quiz_best') || 0);
  bestScoreEl.textContent = prevBest;
}

/* ---------- Start handler ---------- */
startBtn.addEventListener('click', async () => {
  await fetchQuestions();
});

/* ---------- Utility: confetti ---------- */
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
      w: 6 + Math.random() * 10,
      h: 8 + Math.random() * 12,
      vx: -2 + Math.random() * 4,
      vy: 2 + Math.random() * 6,
      angle: Math.random() * 360,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      rotSpeed: -0.1 + Math.random() * 0.2
    });
  }

  let lifetime = 2400; // ms
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    ctxConfetti.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);

    confettiPieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03; // gravity
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

/* ---------- Kickoff: show best score on load ---------- */
saveBestFromStorage();
