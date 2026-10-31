// Bu dosyada linkteki dili (language.html?dil=python) languages.json'dan bulup sayfaya yazıyoruz.
// Sürüm bilgisini o dilin resmî kaynağından okuyoruz; resmî site tarayıcıya izin vermiyorsa resmî sitedeki değeri JSON'a elle yazıyoruz.

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

// Sürüm bilgisini dilin kaynağından okuyoruz. Her kaynağın JSON şekli farklı, bu yüzden ayrı ayrı.
async function loadVersion(language){
    // C++ ve SQL bir program değil standart; canlı sürüm yok, standardı yazıyoruz.
    if (!language.version) {
        languageVersion.textContent = language.standard;
        languageVersionSource.textContent = 'Kaynak: resmî standart';
        return;
    }

    const source = language.version;

    // Resmî site tarayıcıdan okumaya izin vermiyor (CORS); değeri resmî siteden alıp JSON'a elle yazdık.
    if (source.source === 'static') {
        languageVersion.textContent = source.text;
        showSource(source.officialPage, `(son kontrol: ${source.checked})`);
        return;
    }

    try {
        const response = await fetch(source.url);
        if (!response.ok) {
            throw new Error(response.status);
        }
        const data = await response.json();
        languageVersion.textContent = readVersion(source, data);
        showSource(source.officialPage, '(canlı)');
    } catch (error) {
        // İnternet yoksa ya da kaynak cevap vermezse sayfa bozulmasın; resmî sayfaya yönlendiriyoruz.
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

// Kaynağa göre JSON'dan sürüm metnini çıkarıyoruz.
function readVersion(source, data){
    if (source.source === 'godev') {
        // Dizi; en yeni ilk sırada. stable: true olan kararlı sürüm. version "go1.27.3" gibi, baştaki "go"yu atıyoruz.
        const stable = data.find(item => item.stable);
        return `${source.label} ${stable.version.replace('go', '')}`;
    }
    if (source.source === 'nodejs') {
        // Dizi; en yeni ilk sırada. lts alanı LTS sürümlerde isim, diğerlerinde false.
        const lts = data.find(item => item.lts);
        return `${source.label} ${lts.version} (${lts.date})`;
    }
    if (source.source === 'npm') {
        // Tek nesne; version alanı en son kararlı sürüm.
        return `${source.label} ${data.version}`;
    }
    if (source.source === 'dotnet') {
        // releases-index dizisinde desteklenen (active) ilk sürüm en yeni kararlı sürüm.
        const active = data['releases-index'].find(item => item['support-phase'] === 'active');
        return `${source.label} ${active['latest-release']} (${active['latest-release-date']})`;
    }
    throw new Error('Bilinmeyen kaynak');
}

loadLanguage();
