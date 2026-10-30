// Burada quiz.json dosyasını okuyup soruları sayfaya yazdırıyoruz.

// Seçili seviyedeki sorular. Başta boş, veri gelince dolacak.
let allQuestions = [];
// Kaçıncı sorudayız (0'dan başlar, sıra numarası).
let currentIndex = 0;
// Seçilen şıkkın sıra numarası. null = henüz seçilmedi.
let selectedOption = null;

// Sayfadaki elemanları buluyoruz.
const quizCode = document.getElementById('quiz-code');
const quizQuestion = document.getElementById('quiz-question');
const quizOptions = document.getElementById('quiz-options');

// JSON'u okuyup ilk soruyu ekrana çizdiriyoruz.
async function loadQuiz(){
    const response = await fetch('../data/quiz.json');
    const questions = await response.json();
    allQuestions = questions.topics[0]['Giriş'];
    renderQuestion();
}

// Şu anki soruyu, kodunu ve şıklarını ekrana çiziyoruz.
function renderQuestion(){
    const question = allQuestions[currentIndex];
    // Yeni soruda henüz seçim yok.
    selectedOption = null;

    quizCode.textContent = question.code.join('\n');
    quizQuestion.textContent = question.question;

    // Önce eski şıkları siliyoruz, yoksa yenileri eskilerin sonuna eklenir.
    quizOptions.textContent = '';
    question.options.forEach((option, index) => {
        const optionButton = document.createElement('button');
        optionButton.type = 'button';
        optionButton.textContent = option;
        optionButton.classList.add('option-button');
        // Şıkka tıklanınca seçili hâle getiriyoruz.
        optionButton.addEventListener('click', () => selectOption(optionButton, index));
        quizOptions.appendChild(optionButton);
    });
}

// Tıklanan şıkkı seçili yapıyoruz: önce hepsinden selected'ı kaldır, sonra tıklanana ekle.
function selectOption(clickedButton, index){
    const optionButtons = quizOptions.querySelectorAll('.option-button');
    optionButtons.forEach(button => button.classList.remove('selected'));
    clickedButton.classList.add('selected');
    selectedOption = index;
}

loadQuiz();
