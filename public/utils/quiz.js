//Burada artık quiz.json dosyasının okumasını yapacağız.

async function loadQuiz(){
    const response = await fetch('../data/quiz.json');
    const questions = await response.json();
    
    const quizCode = document.getElementById('quiz-code');
    const quizQuestion = document.getElementById('quiz-question');

    quizCode.textContent = questions.topics[0]['Giriş'][0].code.join('\n');
    quizQuestion.textContent = questions.topics[0]['Giriş'][0].question;
}

loadQuiz();