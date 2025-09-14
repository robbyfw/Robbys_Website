const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const quizBox = document.getElementById('quiz-box');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const scoreBox = document.getElementById('score-box');
const scoreEl = document.getElementById('score');

let questions = [];
let currentQuestionIndex = 0;
let score = 0;

startBtn.addEventListener('click', startQuiz);
restartBtn.addEventListener('click', () => location.reload());

async function startQuiz() {
  startBtn.classList.add('hidden');
  quizBox.classList.remove('hidden');

  const res = await fetch('https://opentdb.com/api.php?amount=50&difficulty=easy&type=multiple');
  const data = await res.json();
  questions = data.results;

  currentQuestionIndex = 0;
  score = 0;
  showQuestion();
}

function showQuestion() {
  const current = questions[currentQuestionIndex];
  questionEl.innerHTML = decodeHTML(current.question);

  let answers = [...current.incorrect_answers];
  answers.push(current.correct_answer);
  answers = shuffleArray(answers);

  optionsEl.innerHTML = '';
  answers.forEach(answer => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = decodeHTML(answer);
    btn.addEventListener('click', () => checkAnswer(btn, current.correct_answer));
    optionsEl.appendChild(btn);
  });
}

function checkAnswer(btn, correct) {
  if (btn.innerHTML === decodeHTML(correct)) {
    btn.classList.add('correct');
    score++;
  } else {
    btn.classList.add('wrong');
    // show correct answer
    Array.from(optionsEl.children).forEach(b => {
      if (b.innerHTML === decodeHTML(correct)) b.classList.add('correct');
    });
  }

  // wait 1 sec and next question
  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      showScore();
    }
  }, 1000);
}

function showScore() {
  quizBox.classList.add('hidden');
  scoreBox.classList.remove('hidden');
  scoreEl.innerHTML = score;
}

// Shuffle array
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Decode HTML entities
function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

/* Water motion effect */
const canvas = document.getElementById('water-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let waveArray = [];
for (let i = 0; i < 200; i++) {
  waveArray.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 3 + 1,
    speed: Math.random() * 0.5 + 0.2
  });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  waveArray.forEach(wave => {
    ctx.beginPath();
    ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
    ctx.fill();
    wave.y -= wave.speed;
    if (wave.y < 0) wave.y = canvas.height;
  });
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
