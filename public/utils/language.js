// Bu dosyada linkteki dili (language.html?dil=python) languages.json'dan bulup sayfaya yazıyoruz.
// Sürüm bilgisini bizim sunucudan (/api/version/python gibi) alıyoruz; sunucu da dilin resmî sitesine soruyor.

// Sayfadaki elemanları buluyoruz.
const languageDetail = document.getElementById('language-detail');
const languageError = document.getElementById('language-error');
const languageName = document.getElementById('language-name');
const languageSummary = document.getElementById('language-summary');
const languageTags = document.getElementById('language-tags');
const languageYear = document.getElementById('language-year');
const languageCreator = document.getElementById('language-creator');
const languageUses = document.getElementById('language-uses');
const languageCode = document.getElementById('language-code');
const languageVersion = document.getElementById('language-version');
const languageVersionSource = document.getElementById('language-version-source');
const languageWebsite = document.getElementById('language-website');
const languageQuiz = document.getElementById('language-quiz');
const languageGithub = document.getElementById('language-github');
const languageGithubSource = document.getElementById('language-github-source');
const languageStars = document.getElementById('language-stars');
const languageForks = document.getElementById('language-forks');

// Linkteki dil: language.html?dil=python -> 'python'
const params = new URLSearchParams(window.location.search);
const languageId = params.get('dil');

// languages.json'u okuyup linkteki dili buluyoruz.
async function loadLanguage(){
    try {
        const response = await fetch('../data/languages.json');
        // Dosya bulunamazsa (404) fetch hata vermez, bu yüzden kendimiz kontrol ediyoruz.
        if (!response.ok) {
            throw new Error(response.status);
        }
        const data = await response.json();
        // find: koşula uyan İLK öğeyi verir, bulamazsa undefined.
        const language = data.languages.find(item => item.id === languageId);
        if (!language) {
            showError('Bu dil bulunamadı. Yazılım Dilleri sayfasından bir dil seç.');
            return;
        }
        renderLanguage(language);
        loadVersion(language);
        loadGithub(language);
    } catch (error) {
        showError('Dil bilgileri yüklenemedi. Sayfayı yenileyip tekrar dene.');
    }
}

// Hata mesajını gösterip detay alanını gizliyoruz.
function showError(message){
    languageDetail.classList.add('hidden');
    languageError.classList.remove('hidden');
    languageError.textContent = message;
}

// JSON'daki sabit bilgileri sayfaya yazıyoruz. Veriden gelen metin hep textContent ile.
function renderLanguage(language){
    document.title = `${language.name} | Bit & Beyin`;
    languageName.textContent = language.name;
    languageSummary.textContent = language.summary;
    languageYear.textContent = language.year;
    languageCreator.textContent = language.creator;

    // Etiketler: her etiket için bir rozet
    languageTags.textContent = '';
    language.tags.forEach(tag => {
        const badge = document.createElement('span');
        badge.classList.add('level-badge', 'mt-0');
        badge.textContent = tag;
        languageTags.appendChild(badge);
    });

    // Kullanım alanları: map ile her metinden bir <li> üretip hepsini birden ekliyoruz.
    const useItems = language.uses.map(use => {
        const item = document.createElement('li');
        item.textContent = use;
        return item;
    });
    languageUses.replaceChildren(...useItems);

    // Örnek kod satırları quiz'deki gibi bir liste; join('\n') ile alt alta yazıyoruz.
    languageCode.textContent = language.helloWorld.join('\n');

    languageWebsite.href = language.website;

    // Quiz'i olan dilde buton, olmayanda "Quiz yakında" yazısı
    if (language.quiz) {
        languageQuiz.href = `quiz.html?dil=${language.id}`;
    } else {
        languageQuiz.classList.add('hidden');
        document.getElementById('language-quiz-soon').classList.remove('hidden');
    }
}

// Sürüm bilgisi bizim sunucudan geliyor (/api/version/python gibi).
// Tarayıcı resmî sitelere doğrudan soramıyor (CORS); sunucuda CORS yok, o yüzden sunucu soruyor.
async function loadVersion(language){
    // C++ ve SQL bir program değil standart; canlı sürüm yok, standardı yazıyoruz.
    if (!language.version) {
        languageVersion.textContent = language.standard;
        languageVersionSource.textContent = 'Kaynak: resmî standart';
        return;
    }

    const source = language.version;

    try {
        const response = await fetch(`/api/version/${language.id}`);
        if (!response.ok) {
            throw new Error(response.status);
        }
        const version = await response.json();
        languageVersion.textContent = version.text;

        // Canlı kaynakta "(canlı)", elle yazılmışta son kontrol tarihi
        if (version.live) {
            showSource(source.officialPage, '(canlı)');
        } else {
            showSource(source.officialPage, `(son kontrol: ${version.checked})`);
        }
    } catch (error) {
        // Sunucu kapalıysa ya da resmî site cevap vermezse sayfa bozulmasın; resmî sayfaya yönlendiriyoruz.
        languageVersion.textContent = 'Sürüm bilgisi şu an alınamadı.';
        const link = document.createElement('a');
        link.href = source.officialPage;
        link.textContent = 'Resmî sitede gör';
        link.classList.add('text-primary', 'underline');
        languageVersionSource.textContent = '';
        languageVersionSource.appendChild(link);
    }
    // JavaScript'te sürüm Node.js'in; dilin kendi standardını da altına ekliyoruz.
    if (language.standard) {
        // append: içindeki linki silmeden sonuna metin ekler (textContent += linki silerdi).
        languageVersionSource.append(` · Dil standardı: ${language.standard}`);
    }
}

// "Kaynak: python.org (canlı)" satırını yazıyoruz. Kaynak her zaman dilin resmî sitesi, tıklanabilir link.
function showSource(officialPage, note){
    const link = document.createElement('a');
    link.href = officialPage;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = new URL(officialPage).hostname.replace('www.', '');
    link.classList.add('text-primary', 'underline');
    languageVersionSource.textContent = 'Kaynak: ';
    languageVersionSource.append(link, ` ${note}`);
}

// GitHub bilgisi bizim sunucudan geliyor (/api/github/python gibi); token sunucuda kalıyor.
async function loadGithub(language){
    // SQL gibi resmî deposu olmayan dillerde sunucuya hiç sormuyoruz.
    if (!language.github) {
        languageGithub.textContent = 'Bu dilin resmî GitHub deposu yok.';
        return;
    }

    try {
        // Adres "/" ile başlıyor: sayfa hangi sunucudan geldiyse istek de oraya gider.
        const response = await fetch(`/api/github/${language.id}`);
        if (!response.ok) {
            throw new Error(response.status);
        }
        const repo = await response.json();

        // 77755 -> "77.755" (Türkçe sayı biçimi)
        const stars = repo.stars.toLocaleString('tr-TR');
        const forks = repo.forks.toLocaleString('tr-TR');
        languageStars.textContent = stars;
        languageForks.textContent = forks;

        // Repo linki + son güncelleme tarihi
        const link = document.createElement('a');
        link.href = repo.url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = repo.name;
        link.classList.add('text-primary', 'underline');
        // "2026-10-31T20:13:35Z" -> "31.10.2026"
        const date = new Date(repo.pushedAt).toLocaleDateString('tr-TR');
        languageGithubSource.textContent = '';
        languageGithubSource.append(link, ` · son güncelleme: ${date}`);
    } catch (error) {
        // Sunucu kapalıysa ya da token geçersizse sayfa bozulmasın.
        languageGithub.textContent = 'GitHub bilgisi şu an alınamadı.';
    }
}

// Sayfa açılınca işe başla.
loadLanguage();