// Burada quiz.json dosyasını okuyup soruları sayfaya yazdırıyoruz.

// Seçili seviyedeki sorular. Başta boş, veri gelince dolacak.
let allQuestions = [];
// Kaçıncı sorudayız (0'dan başlar, sıra numarası).
let currentIndex = 0;
// Seçilen şıkkın sıra numarası. null = henüz seçilmedi.
let selectedOption = null;
// Canlı skor
let correctCount = 0;
let wrongCount = 0;

// Sayfadaki elemanları buluyoruz.
const quizArea = document.getElementById('quiz-area');
const quizLabel = document.getElementById('quiz-label');
const quizScore = document.getElementById('quiz-score');
const quizCode = document.getElementById('quiz-code');
const quizQuestion = document.getElementById('quiz-question');
const quizOptions = document.getElementById('quiz-options');
const quizFeedback = document.getElementById('quiz-feedback');
const quizResultText = document.getElementById('quiz-result-text');
const quizExplanation = document.getElementById('quiz-explanation');
const checkButton = document.getElementById('check-button');
const nextButton = document.getElementById('next-button');
const quizResult = document.getElementById('quiz-result');
const quizResultSummary = document.getElementById('quiz-result-summary');
const restartButton = document.getElementById('restart-button');

// JSON'u okuyup quiz'i başlatıyoruz.
async function loadQuiz(){
    const response = await fetch('../data/quiz.json');
    const questions = await response.json();
    allQuestions = questions.topics[0]['Giriş'];
    startQuiz();
}

// Quiz'i baştan başlatıyoruz: sayaçlar sıfır, ilk soru, sonuç ekranı gizli.
function startQuiz(){
    currentIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    quizResult.classList.add('hidden');
    quizArea.classList.remove('hidden');
    renderQuestion();
}

// Skor satırını yeniliyoruz. Kalan = toplam - cevaplananlar.
function updateScore(){
    const remaining = allQuestions.length - correctCount - wrongCount;
    quizScore.textContent = `Doğru: ${correctCount} · Yanlış: ${wrongCount} · Kalan: ${remaining}`;
}

// Şu anki soruyu, kodunu ve şıklarını ekrana çiziyoruz.
function renderQuestion(){
    const question = allQuestions[currentIndex];
    // Yeni soruda henüz seçim yok.
    selectedOption = null;

    quizLabel.textContent = `Soru ${currentIndex + 1} / ${allQuestions.length}`;
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

    // Açıklama kutusu gizli, kontrol butonu seçim yapılana kadar pasif, sonraki butonu gizli.
    quizFeedback.classList.add('hidden');
    checkButton.disabled = true;
    checkButton.classList.remove('hidden');
    nextButton.classList.add('hidden');
    updateScore();
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

    // Doğru / yanlış mesajı, "Neden?" açıklaması ve skor
    if (isCorrect) {
        quizResultText.textContent = 'Doğru! 🎉';
        correctCount++;
    } else {
        quizResultText.textContent = `Yanlış. Doğru cevap: ${question.options[question.answer]}`;
        wrongCount++;
    }
    quizExplanation.textContent = question.explanation;
    quizFeedback.classList.remove('hidden');
    updateScore();

    // Kontrol butonu gider, yerine sonraki butonu gelir. Son soruysa "Sonucu gör" yazar.
    checkButton.classList.add('hidden');
    if (currentIndex + 1 < allQuestions.length) {
        nextButton.textContent = 'Sonraki soru';
    } else {
        nextButton.textContent = 'Sonucu gör';
    }
    nextButton.classList.remove('hidden');
}

// Sonraki soruya geçiyoruz. Sorular bittiyse sonuç ekranı açılır.
function goNext(){
    currentIndex++;
    if (currentIndex >= allQuestions.length) {
        showResult();
        return;
    }
    renderQuestion();
}

// Soru alanını gizleyip sonucu gösteriyoruz.
function showResult(){
    quizArea.classList.add('hidden');
    quizResultSummary.textContent = `${allQuestions.length} sorudan ${correctCount} doğru, ${wrongCount} yanlış.`;
    quizResult.classList.remove('hidden');
}

checkButton.addEventListener('click', checkAnswer);
nextButton.addEventListener('click', goNext);
restartButton.addEventListener('click', startQuiz);

loadQuiz();
