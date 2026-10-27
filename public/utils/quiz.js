//Burada artık quiz.json dosyasının okumasını yapacağız.

async function loadQuiz(){
    const response = await fetch('../data/quiz.json');
    const questions = await response.json();
    
    const quizCode = document.getElementById('quiz-code');
    const quizQuestion = document.getElementById('quiz-question');

    quizCode.textContent = questions.topics[0]['Giriş'][0].code.join('\n');
    quizQuestion.textContent = questions.topics[0]['Giriş'][0].question;

    const quizOptions = document.getElementById('quiz-options');
    questions.topics[0]['Giriş'][0].options.forEach(option => {
        const optionButton = document.createElement('button');
        optionButton.textContent = option;
        quizOptions.appendChild(optionButton);
    });
    
}

loadQuiz();