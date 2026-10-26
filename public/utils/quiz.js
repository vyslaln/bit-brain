//Burada artık quiz.json dosyasının okumasını yapacağız.

async function loadQuiz(){
    const response = await fetch('../data/quiz.json');
    const questions = await response.json();
    console.log(questions.topics[0]['Giriş'][0])
}

loadQuiz();