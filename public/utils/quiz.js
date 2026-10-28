// Burada quiz.json dosyasını okuyup ilk soruyu sayfaya yazdırıyoruz.
async function loadQuiz(){
    // Burada JSON dosyasını getiriyoruz (fetch) ve JS nesnesine çeviriyoruz (json)
    const response = await fetch('../data/quiz.json');
    const questions = await response.json();

    // Burada sorunun kodunu ve metnini yazacağımız elemanları buluyoruz
    const quizCode = document.getElementById('quiz-code');
    const quizQuestion = document.getElementById('quiz-question');

    // Burada kod satırlarını alt alta, soruyu da kendi alanına yazdırıyoruz
    quizCode.textContent = questions.topics[0]['Giriş'][0].code.join('\n');
    quizQuestion.textContent = questions.topics[0]['Giriş'][0].question;

    // Burada her şık için bir buton oluşturup şıklar kutusuna ekliyoruz
    const quizOptions = document.getElementById('quiz-options');
    questions.topics[0]['Giriş'][0].options.forEach(option => {
        const optionButton = document.createElement('button');
        optionButton.textContent = option;
        optionButton.classList.add('option-button');
        quizOptions.appendChild(optionButton);
    });
}

// Burada sayfa açılınca fonksiyonu çalıştırıyoruz
loadQuiz();