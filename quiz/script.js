const apiUrl = 'https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple';

document.getElementById('startBtn').addEventListener('click', startQuiz);

async function startQuiz() {
    const category = document.getElementById('category').value;
    const difficulty = document.getElementById('difficulty').value;
    const url = `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.response_code === 0) {
        displayQuestions(data.results);
    } else {
        alert('Failed to fetch questions. Please try again later.');
    }
}

function displayQuestions(questions) {
    const quizContainer = document.getElementById('quiz');
    quizContainer.innerHTML = '';

    questions.forEach((questionData, index) => {
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.innerHTML = `
            <h2>${questionData.question}</h2>
            <ul class="options">
                ${shuffleOptions([questionData.correct_answer, ...questionData.incorrect_answers]).map(option => `
                    <li><button onclick="checkAnswer(this, '${option}', '${questionData.correct_answer}')">${option}</button></li>
                `).join('')}
            </ul>
        `;
        quizContainer.appendChild(questionElement);
    });

    const scoreElement = document.getElementById('score');
    scoreElement.innerHTML = 'Score: 0';
}

function shuffleOptions(options) {
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
}

function checkAnswer(button, selected, correct) {
    const isCorrect = selected === correct;
    button.classList.add(isCorrect ? 'correct' : 'incorrect');
    button.disabled = true;

    const allButtons = button.closest('.options').querySelectorAll('button');
    allButtons.forEach(btn => btn.disabled = true);

    const scoreElement = document.getElementById('score');
    let currentScore = parseInt(scoreElement.innerText.split(': ')[1]);
    scoreElement.innerHTML = `Score: ${isCorrect ? currentScore + 10 : currentScore}`;
}
