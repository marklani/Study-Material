// quiz.js

let quizData = []; // This will store the data fetched from JSON
let currentQuestionIndex = 0;
// Map stores {questionIndex: {selected: 'option', isCorrect: true/false}}
const userAnswers = new Map();

const questionArea = document.getElementById('question-area');
const loadingMessage = document.getElementById('loading-message');
const scoreStatusElement = document.getElementById('score-status');
const feedbackMessageElement = document.getElementById('feedback-message');
const questionTextElement = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const qNumberSpan = document.getElementById('q-number');
const resultContainer = document.getElementById('result-container');
const quizContainer = document.getElementById('quiz-container');
const scoreText = document.getElementById('score-text');
// 1. Get the requested number of questions from sessionStorage
requestedCount = sessionStorage.getItem('count');

// --- Helper Functions ---

/**
 * Shuffles array in place using the Fisher-Yates (Knuth) algorithm.
 * @param {Array} array The array to shuffle.
 */
function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

function updateScoreDisplay() {
    let score = 0;
    let answeredCount = 0;
    quizData.forEach((_, index) => {
        const answerData = userAnswers.get(index);
        if (answerData) {
            answeredCount++;
            if (answerData.isCorrect) {
                score++;
            }
        }
    });

    scoreStatusElement.innerHTML = `✅ **Current Score:** ${score} / ${requestedCount} | **Answered:** ${answeredCount} / ${requestedCount}`;
}

// --- Core Quiz Functions ---

function loadQuestion() {
    if (requestedCount === 0 || currentQuestionIndex >= requestedCount) {
        return;
    }

    const totalQuestions = requestedCount;
    const currentQuestion = quizData[currentQuestionIndex];
    const answerData = userAnswers.get(currentQuestionIndex);
    const questionWasAnswered = !!answerData;

    // Clear feedback before loading
    feedbackMessageElement.innerHTML = '';

    // Update question number text
    qNumberSpan.textContent = `Question ${currentQuestionIndex + 1} of ${requestedCount}`;

    // Update question text
    questionTextElement.innerHTML = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;
    optionsContainer.innerHTML = ''; // Clear previous options

    // Create option buttons
    currentQuestion.options.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('option-btn');
        button.textContent = option;
        button.dataset.option = option;

        if (questionWasAnswered) {
            button.disabled = true; // Lock options if already answered

            // Apply styling based on stored result
            if (option === answerData.selected) {
                button.classList.add('selected');
                if (!answerData.isCorrect) {
                    button.classList.add('incorrect'); // Highlight user's wrong choice
                }
            }
            if (option === currentQuestion.answer) {
                button.classList.add('correct-answer'); // Highlight the correct answer
            }
        } else {
            // Attach event listener only if not answered
            button.addEventListener('click', () => selectOption(option, button));
        }

        optionsContainer.appendChild(button);
    });

    // If answered, show feedback
    if (questionWasAnswered) {
        if (answerData.isCorrect) {
            feedbackMessageElement.innerHTML = '<span style="color: #004d40; font-weight: bold;">✅ Correct!</span>';
        } else {
            feedbackMessageElement.innerHTML = `<span style="color: #e53935; font-weight: bold;">❌ Incorrect.</span> The correct answer was: <strong>${currentQuestion.answer}</strong>.`;
        }
    }

    // Update the score display on every load
    updateScoreDisplay();

    // Update control button visibility
    prevBtn.disabled = currentQuestionIndex === 0;

    if (currentQuestionIndex === totalQuestions - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
}

function selectOption(selectedOption, button) {
    // Prevent re-selection once an answer is chosen for this question
    if (userAnswers.has(currentQuestionIndex)) {
        return;
    }

    const currentQuestion = quizData[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.answer;

    // 1. Save and check the user's choice
    userAnswers.set(currentQuestionIndex, {
        selected: selectedOption,
        isCorrect: isCorrect
    });

    // 2. Visually update and show feedback
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true; // Lock all options
        btn.classList.remove('selected');

        if (btn.dataset.option === selectedOption) {
            btn.classList.add('selected');
        }

        // Highlight the correct answer
        if (btn.dataset.option === currentQuestion.answer) {
            btn.classList.add('correct-answer');
        } else if (btn.dataset.option === selectedOption && !isCorrect) {
            btn.classList.add('incorrect'); // Highlight user's wrong choice
        }
    });

    // Display immediate feedback
    if (isCorrect) {
        feedbackMessageElement.innerHTML = '<span style="color: #004d40; font-weight: bold;">✅ Correct!</span>';
    } else {
        feedbackMessageElement.innerHTML = `<span style="color: #e53935; font-weight: bold;">❌ Incorrect.</span> The correct answer was: <strong>${currentQuestion.answer}</strong>.`;
    }

    // 3. Update score display
    updateScoreDisplay();
}

function calculateScore() {
    let score = 0;
    quizData.forEach((_, index) => {
        const answerData = userAnswers.get(index);
        if (answerData && answerData.isCorrect) {
            score++;
        }
    });
    return score;
}

function showResults() {
    const finalScore = calculateScore();
    const totalQuestions = quizData.length;

    quizContainer.style.display = 'none';
    resultContainer.style.display = 'block';
    scoreText.textContent = `You scored ${finalScore} out of ${totalQuestions} (${((finalScore / totalQuestions) * 100).toFixed(1)}%).`;
}


// --- Data Loading and Initialization ---

async function loadQuizData() {
    try {
        const response = await fetch('quiz_data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let data = await response.json();

        // Check for invalid input: not a number, less than 1, or more than available data
        if (isNaN(requestedCount) || requestedCount < 1 || requestedCount > data.length) {
            // Default to max (100) if invalid or not specified
            requestedCount = data.length;
        }

        // 2. Shuffle the full data array (essential for random subset)
        let shuffledData = shuffleArray(data);

        // 3. Slice the array to the requested size
        quizData = shuffledData.slice(0, requestedCount);

        // Hide loading message, show quiz area, and start the quiz
        loadingMessage.style.display = 'none';
        questionArea.style.display = 'block';
        loadQuestion();

    } catch (error) {
        console.error("Could not load quiz data:", error);
        loadingMessage.textContent = "Error loading quiz data. Please check the 'quiz_data.json' file and ensure a local server is running if needed.";
    }
}

// --- Event Listeners ---

prevBtn.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentQuestionIndex < requestedCount - 1) {
        currentQuestionIndex++;
        loadQuestion();
    }
});

submitBtn.addEventListener('click', () => {
    // Check if all questions are answered before submitting
    if (userAnswers.size < requestedCount) {
        if (!confirm(`You have only answered ${userAnswers.size} of ${requestedCount} questions. Are you sure you want to submit?`)) {
            return;
        }
    }
    showResults();
});

// Start the process by loading the data
loadQuizData();