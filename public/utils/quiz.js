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
const quizFeedback = document.getElementById('quiz-feedback');
const quizResultText = document.getElementById('quiz-result-text');
const quizExplanation = document.getElementById('quiz-explanation');
const checkButton = document.getElementById('check-button');

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

    // Açıklama kutusu gizli, kontrol butonu seçim yapılana kadar pasif.
    quizFeedback.classList.add('hidden');
    checkButton.disabled = true;
}

// Tıklanan şıkkı seçili yapıyoruz: önce hepsinden selected'ı kaldır, sonra tıklanana ekle.
function selectOption(clickedButton, index){
    const optionButtons = quizOptions.querySelectorAll('.option-button');
    optionButtons.forEach(button => button.classList.remove('selected'));
    clickedButton.classList.add('selected');
    selectedOption = index;
    // Artık bir seçim var, kontrol butonu açılabilir.
    checkButton.disabled = false;
}

// Seçilen şıkkı doğru cevapla karşılaştırıyoruz.
function checkAnswer(){
    const question = allQuestions[currentIndex];
    const isCorrect = selectedOption === question.answer;

    // Şıkları kilitliyoruz: doğru şık yeşil, yanlış seçilen şık kırmızı olur.
    const optionButtons = quizOptions.querySelectorAll('.option-button');
    optionButtons.forEach((button, index) => {
        button.disabled = true;
        button.classList.remove('selected');
        if (index === question.answer) {
            button.classList.add('correct');
        } else if (index === selectedOption) {
            button.classList.add('wrong');
        }
    });

    // Doğru / yanlış mesajı ve "Neden?" açıklaması
    if (isCorrect) {
        quizResultText.textContent = 'Doğru! 🎉';
    } else {
        quizResultText.textContent = `Yanlış. Doğru cevap: ${question.options[question.answer]}`;
    }
    quizExplanation.textContent = question.explanation;
    quizFeedback.classList.remove('hidden');

    // Aynı soruyu ikinci kez kontrol etmek olmasın.
    checkButton.disabled = true;
}

checkButton.addEventListener('click', checkAnswer);

loadQuiz();
