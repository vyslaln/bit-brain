// Burada quiz.json dosyasını okuyup soruları sayfaya yazdırıyoruz.

// JSON'un tamamı (dil + konular). Bir kere okunur, sonra buradan seçilir.
let quizData = null;
// Seçili konu ve seviyedeki sorular. Başta boş, veri gelince dolacak.
let allQuestions = [];
// Seçili konunun sıra numarası ve seçili seviye
let currentTopic = 0;
let currentLevel = 'Giriş';
// Kaçıncı sorudayız (0'dan başlar, sıra numarası).
let currentIndex = 0;
// Seçilen şıkkın sıra numarası. null = henüz seçilmedi.
let selectedOption = null;
// Canlı skor
let correctCount = 0;
let wrongCount = 0;
// İkiz sorudayız mı? (yanlış cevaptan sonra gelen, skora sayılmayan soru)
let isFollowUp = false;
// Ana soru yanlış cevaplandı, sırada ikiz soru var mı?
let needsFollowUp = false;

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
const topicSelect = document.getElementById('topic');
const levelButtons = document.querySelectorAll('.level-button');

// JSON'u bir kere okuyoruz, konu menüsünü doldurup quiz'i başlatıyoruz.
async function loadQuiz(){
    const response = await fetch('../data/quiz.json');
    quizData = await response.json();
    fillTopics();
    startQuiz();
}

// Konu menüsünü JSON'daki konulardan dolduruyoruz. value = konunun sıra numarası.
function fillTopics(){
    topicSelect.textContent = '';
    quizData.topics.forEach((topic, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = topic.topic;
        topicSelect.appendChild(option);
    });
}

// Seçili konu ve seviyeye göre quiz'i baştan başlatıyoruz: sayaçlar sıfır, ilk soru, sonuç ekranı gizli.
function startQuiz(){
    allQuestions = quizData.topics[currentTopic][currentLevel];
    currentIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    isFollowUp = false;
    needsFollowUp = false;
    quizResult.classList.add('hidden');
    quizArea.classList.remove('hidden');
    renderQuestion();
}

// Skor satırını yeniliyoruz. Kalan = toplam - cevaplananlar.
function updateScore(){
    const remaining = allQuestions.length - correctCount - wrongCount;
    quizScore.textContent = `Doğru: ${correctCount} · Yanlış: ${wrongCount} · Kalan: ${remaining}`;
}

// Şu anki soruyu buluyoruz: ikiz sorudaysak ana sorunun followUp'ı, değilsek ana sorunun kendisi.
function getCurrentQuestion(){
    const mainQuestion = allQuestions[currentIndex];
    if (isFollowUp) {
        return mainQuestion.followUp;
    }
    return mainQuestion;
}

// Şu anki soruyu, kodunu ve şıklarını ekrana çiziyoruz.
function renderQuestion(){
    const question = getCurrentQuestion();
    // Yeni soruda henüz seçim yok.
    selectedOption = null;

    // Karışık listedeki sorular kendi seviyesini söyler (level alanı), onu da gösteriyoruz.
    if (isFollowUp) {
        quizLabel.textContent = 'İkiz soru (skora sayılmaz)';
    } else if (question.level) {
        quizLabel.textContent = `Soru ${currentIndex + 1} / ${allQuestions.length} · ${question.level}`;
    } else {
        quizLabel.textContent = `Soru ${currentIndex + 1} / ${allQuestions.length}`;
    }
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
    const question = getCurrentQuestion();
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

    // Doğru / yanlış mesajı ve "Neden?" açıklaması (ikiz sorularda açıklama yok, boş kalır)
    if (isCorrect) {
        quizResultText.textContent = 'Doğru! 🎉';
    } else {
        quizResultText.textContent = `Yanlış. Doğru cevap: ${question.options[question.answer]}`;
    }
    quizExplanation.textContent = question.explanation || '';
    quizFeedback.classList.remove('hidden');

    // Skor sadece ana sorularda sayılır. Ana soru yanlışsa ve ikizi varsa sırada ikiz soru var.
    if (isFollowUp) {
        needsFollowUp = false;
    } else {
        if (isCorrect) {
            correctCount++;
        } else {
            wrongCount++;
        }
        needsFollowUp = !isCorrect && question.followUp !== undefined;
    }
    updateScore();

    // Kontrol butonu gider, yerine sonraki butonu gelir. Yazısı duruma göre değişir.
    checkButton.classList.add('hidden');
    if (needsFollowUp) {
        nextButton.textContent = 'İkiz soruyu çöz';
    } else if (currentIndex + 1 < allQuestions.length) {
        nextButton.textContent = 'Sonraki soru';
    } else {
        nextButton.textContent = 'Sonucu gör';
    }
    nextButton.classList.remove('hidden');
}

// Sonraki adıma geçiyoruz: sırada ikiz soru varsa onu, yoksa sonraki ana soruyu çiziyoruz.
// Sorular bittiyse sonuç ekranı açılır.
function goNext(){
    if (needsFollowUp) {
        isFollowUp = true;
        needsFollowUp = false;
        renderQuestion();
        return;
    }
    isFollowUp = false;
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

// Konu değişince o konunun sorularıyla baştan başlıyoruz.
topicSelect.addEventListener('change', () => {
    currentTopic = Number(topicSelect.value);
    startQuiz();
});

// Seviye butonu: sözlükteki gibi önce hepsinden active'i kaldır, tıklanana ekle, sonra o seviyeyi yükle.
levelButtons.forEach(button => {
    button.addEventListener('click', () => {
        levelButtons.forEach(otherButton => otherButton.classList.remove('active'));
        button.classList.add('active');
        currentLevel = button.dataset.level;
        startQuiz();
    });
});

loadQuiz();
