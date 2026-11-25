//Repo detay sayfası: adresteki ?repo=sahip/ad değerini okuyup /api/repo'dan gelen bilgilerle sayfayı doldurur

//bir rozet (span) oluşturup geri verir; dil, lisans ve konularda kullanılır
//className verilmezse dil/lisans rozeti stili (level-badge), konular için 'topic-badge'
function createBadge(text, className = 'level-badge') {
    const badge = document.createElement('span');
    badge.classList.add(className);
    //level-badge'in üst boşluğunu (mt-3) kaldır; satırdaki aralığı kutunun gap'i veriyor
    if (className === 'level-badge') {
        badge.classList.add('mt-0');
    }
    badge.textContent = text;
    return badge;
}

//Sayfa açılınca çalışacak ana fonksiyon; fetch beklediği için async
async function loadRepo() {
    //durum mesajının yazılacağı paragraf
    const repoStatus = document.getElementById('repo-status');

    //adresin ? sonrasını (orn. "?repo=facebook/react") URLSearchParams'a veriyoruz
    const params = new URLSearchParams(window.location.search);

    //repo değerini al (adreste yoksa null gelir)
    const repoName = params.get('repo');

    //değer yoksa kullanıcıya mesaj yaz ve fonksiyondan çık
    if (!repoName) {
        repoStatus.textContent = 'Bir repo seçilmedi.';
        return;
    }

    try {
        //sunucuya sor; repo adını adrese koymadan önce encodeURIComponent ile kodla
        const response = await fetch(`/api/repo?name=${encodeURIComponent(repoName)}`);

        //repo yoksa sunucu 404 döner; bunu genel hatadan ayırıp kullanıcıya doğru mesajı göster
        if (response.status === 404) {
            repoStatus.textContent = 'Repo bulunamadı.';
            return;
        }

        //sunucu başka bir hata döndürdüyse catch'e git
        if (!response.ok) {
            throw new Error(`Repo alınamadı: ${response.status}`);
        }

        //cevabı JSON'a çevir
        const repo = await response.json();

        //bilgiler geldi: yükleniyor mesajını kaldır, gizli alanı göster
        repoStatus.textContent = '';
        document.getElementById('repo-detail').hidden = false;

        //başlık alanı: sahip ve repo adı
        document.getElementById('repo-owner').textContent = repo.owner;
        document.getElementById('repo-name').textContent = repo.name;
        //açıklama boş (null) olabilir; o zaman yedek metni göster
        document.getElementById('repo-description').textContent = repo.description || 'Bu reponun açıklaması bulunamadı.';
        //GitHub'da aç düğmesinin adresi
        document.getElementById('repo-link').href = repo.url;

        //sahibin avatarı; alt metni ekran okuyucular için (orn. "react avatarı")
        const avatar = document.getElementById('repo-avatar');
        avatar.src = repo.avatar;
        avatar.alt = `${repo.owner} avatarı`;

        //rozetler: dil ve lisans (ikisi de null olabilir, o zaman hiç ekleme)
        const badges = document.getElementById('repo-badges');
        if (repo.language) {
            badges.appendChild(createBadge(repo.language));
        }
        if (repo.license) {
            badges.appendChild(createBadge(`${repo.license} lisansı`));
        }

        //konular (#etiketler); topics bir dizi, boşsa forEach hiç dönmez
        const topics = document.getElementById('repo-topics');
        repo.topics.forEach(topic => {
            topics.appendChild(createBadge(`#${topic}`, 'topic-badge'));
        });

        //sayı kartları; toLocaleString('tr-TR') 252870'i "252.870" yapar
        document.getElementById('repo-stars').textContent = repo.stars.toLocaleString('tr-TR');
        document.getElementById('repo-forks').textContent = repo.forks.toLocaleString('tr-TR');
        document.getElementById('repo-watchers').textContent = repo.watchers.toLocaleString('tr-TR');
        document.getElementById('repo-issues').textContent = repo.openIssues.toLocaleString('tr-TR');

        //son güncelleme: pushedAt metnini Date'e çevirip "21 Kas 2026" gibi yaz (explore.js'teki biçim)
        document.getElementById('repo-pushed').textContent = new Date(repo.pushedAt).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch (error) {
        //hatayı konsola yaz, sayfaya sade bir mesaj göster
        console.error('Repo hatası:', error);
        repoStatus.textContent = 'Repo bilgisi şu an alınamıyor.';
    }
}

//README bölümü: /api/readme'den reponun README metnini alıp ilk paragraflarını sayfaya yazar
async function loadReadme(repoName) {
    //sunucudaki README ucuna istek at; repo adı adrese güvenli biçimde eklenir
    const response = await fetch(`/api/readme?name=${encodeURIComponent(repoName)}`);

    //README yoksa (404) ya da başka bir hata olursa sessizce çık; README kutusu gizli kalır
    if (!response.ok) {
        return;
    }

    //cevabı JSON'a çevir: { content: README metni, url: GitHub'daki README adresi }
    const readme = await response.json();

    //metni boş satırlardan (iki alt satır) bölüp paragraf dizisine çevir
    const paragraphs = readme.content.split('\n\n');

    //sadece düz yazı paragraflarını tut: başlıkları (#), markdown resimlerini (!), HTML satırlarını (<) ve rozetleri ([) at
    const textParagraphs = paragraphs.filter(paragraph => !paragraph.startsWith('#') && !paragraph.startsWith('!') && !paragraph.startsWith('<') && !paragraph.startsWith('['));

    //kısa versiyon: sadece ilk 2 paragrafı al (0 ve 1; bitiş indeksi dahil değil)
    const shortParagraphs = textParagraphs.slice(0, 2);

    //paragrafların yazılacağı kutu
    const readmeText = document.getElementById('repo-readme-text');

    //her paragraf için bir <p> oluştur, metni textContent ile güvenli yaz (HTML çalışmaz) ve kutuya ekle
    shortParagraphs.forEach(paragraph => {
        const p = document.createElement('p');
        p.textContent = paragraph;
        readmeText.appendChild(p);
    });

    //"Tamamını GitHub'da oku" linkine README'nin GitHub adresini ver
    document.getElementById('repo-readme-link').href = readme.url;
    //README kutusunu görünür yap
    document.getElementById('repo-readme').hidden = false;
}

loadRepo();
