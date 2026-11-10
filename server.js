// Express paketini yukle ve uygulamayi olustur
const express = require('express');
const app = express();
const PORT = 5000;

// Bazi aglarda IPv6 calismiyor ve surum bilgisi okunamiyor; Node'u once IPv4 denemeye zorluyoruz
require('node:dns').setDefaultResultOrder('ipv4first');

// .env dosyasini process.env'e yukle (her seyden once)
// Token asla console.log'a yazilmaz
try {
    require('node:process').loadEnvFile();
} catch (error) {
    // Vercel'de .env yok; token Vercel ayarlarindan gelir
    console.log('.env bulunamadi, ortam degiskenleri kullaniliyor:', error.message);
}

// public klasorundeki html, css, js dosyalarini oldugu gibi sun
// (.env ve server.js kok klasorde oldugu icin disariya acilmaz)
app.use(express.static('public'));

// Vercel'de express.static calismiyor; ana sayfaya gelen istegi index.html'e yonlendir
app.get('/', (req,res) => {
    res.redirect('/index.html');
});

// Dil listesi: hangi dilin hangi GitHub reposu oldugunu buradan okuyoruz
const languages = require('./public/data/languages.json').languages;

// Ornek: /api/github/python -> req.params.id = 'python'
app.get('/api/github/:id', async (req, res) => {
// Sadece listedeki dillere izin ver; kullanici istedigi repoyu sorgulatamasin
const language = languages.find(item => item.id === req.params.id);

// Dil yoksa ya da GitHub reposu yoksa (orn. SQL) 404 don
if (!language || !language.github) {
return res.status(404).json({ error: 'Bu dil icin GitHub deposu yok.' });
}

try {
// GitHub'a repo bilgisini sor; token sadece burada, sunucuda kullaniliyor
const response = await fetch(`https://api.github.com/repos/${language.github}`, {
    headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'bit-beyin'
    }
});

// GitHub hata dondurduyse (orn. token gecersiz) catch'e git
if (!response.ok) {
    throw new Error(`GitHub cevabi: ${response.status}`);
}

const repo = await response.json();

// Sayfaya GitHub'in tum cevabini degil, sadece 5 alani gonder
res.json({
    name: repo.full_name,
    url: repo.html_url,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    pushedAt: repo.pushed_at
});
} catch (error) {
// Hatayi sunucu konsoluna yaz, sayfaya sade bir mesaj gonder
console.error('GitHub hatasi:', error.message);
res.status(502).json({ error: 'GitHub bilgisi su an alinamadi.' });
}
});

// Surum kaynagina gore resmi sitenin JSON cevabindan kisa surum metnini cikar
// Her kaynagin JSON sekli farkli, bu yuzden ayri ayri okuyoruz
function readVersion(source, data) {
    if (source.source === 'godev') {
        // Dizi; en yeni ilk sirada. stable: true olan kararli surum. version "go1.27.3" gibi, bastaki "go"yu atiyoruz
        const stable = data.find(item => item.stable);
        return `${source.label} ${stable.version.replace('go', '')}`;
    }
    if (source.source === 'nodejs') {
        // Dizi; en yeni ilk sirada. lts alani LTS surumlerde isim, digerlerinde false
        const lts = data.find(item => item.lts);
        return `${source.label} ${lts.version} (${lts.date})`;
    }
    if (source.source === 'npm') {
        // Tek nesne; version alani en son kararli surum
        return `${source.label} ${data.version}`;
    }
    if (source.source === 'dotnet') {
        // releases-index dizisinde desteklenen (active) ilk surum en yeni kararli surum
        const active = data['releases-index'].find(item => item['support-phase'] === 'active');
        return `${source.label} ${active['latest-release']} (${active['latest-release-date']})`;
    }
    if (source.source === 'python') {
        // Dizi; sira garantisi yok. is_latest her dalin (Python 2, Python 3, install manager) en yenisini isaretliyor
        // Bize Python 3'un en yenisi lazim: is_latest true VE version 3 olan kayit
        const python = data.find(item => item.is_latest && item.version === 3);
        // name zaten "Python 3.15.2"; release_date "2026-10-25T04:15:38Z", ilk 10 karakter tarih
        return `${python.name} (${python.release_date.slice(0, 10)})`;
    }
    if (source.source === 'oracle') {
        // Liste "items" kutusunun icinde; sira garantisi yok, o yuzden en buyuk ana surumu kendimiz buluyoruz
        // jdkVersion "27", "25", "8-perf" gibi metin; parseInt bastaki sayiyi alir ("8-perf" -> 8)
        // slice() ile kopya aliyoruz, sort orijinal diziyi degistirmesin; buyukten kucuge siraliyoruz
        const sorted = data.items.slice().sort((a, b) => parseInt(b.jdkDetails.jdkVersion) - parseInt(a.jdkDetails.jdkVersion));
        // En yeni surum: listenin basi. En yeni LTS: isLts true olan ilk kayit
        const latest = sorted[0];
        const lts = sorted.find(item => item.jdkDetails.isLts);
        return `${source.label} ${latest.jdkDetails.latestReleaseVersion} · LTS: ${source.label} ${lts.jdkDetails.latestReleaseVersion}`;
    }
    throw new Error('Bilinmeyen surum kaynagi');
}

// Ornek: /api/version/go -> { text: 'Go 1.27.3', live: true }
// Tarayici resmi sitelere dogrudan soramiyor (CORS); sunucuda CORS yok, o yuzden burada soruyoruz
app.get('/api/version/:id', async (req, res) => {
    // Sadece listedeki dillere izin ver; kullanici istedigi adresi sorgulatamasin
    const language = languages.find(item => item.id === req.params.id);

    // Dil yoksa ya da surum kaynagi yoksa (orn. C++, SQL standart oldugu icin null) 404 don
    if (!language || !language.version) {
        return res.status(404).json({ error: 'Bu dil icin surum kaynagi yok.' });
    }

    // Elle yazilmis surum: resmi siteden alinip JSON'a yazildi, kontrol tarihiyle birlikte gonder
    if (language.version.source === 'static') {
        return res.json({ text: language.version.text, checked: language.version.checked, live: false });
    }

    try {
        // 1. Resmi siteye sor
        const response = await fetch(language.version.url);

        // 2. Site hata dondurduyse catch'e git
        if (!response.ok) {
            throw new Error(`Surum cevabi: ${response.status}`);
        }

        // 3. Cevabi JSON'a cevir
        const data = await response.json();

        // 4. Uzun listenin tamamini degil, sadece kisa surum metnini gonder
        res.json({ text: readVersion(language.version, data), live: true });
    } catch (error) {
        // Hatayi sunucu konsoluna yaz, sayfaya sade bir mesaj gonder
        console.error('Surum hatasi:', error.message);
        res.status(502).json({ error: 'Surum bilgisi su an alinamadi.' });
    }
});

// ===== KESFET SAYFASI: GitHub Search API =====

// Butondaki deger -> GitHub'in bekledigi dil adi
// Bu nesne ayni zamanda izin listesi (allowlist): anahtari burada olmayan dil reddedilir
// languages.json'u kullanmiyoruz: orada SQL var, 'all' yok ve GitHub 'csharp' degil 'C#' bekliyor
const exploreLanguages = {
    all: null,               // null = dil filtresi yok
    javascript: 'JavaScript',
    python: 'Python',
    typescript: 'TypeScript',
    java: 'Java',
    csharp: 'C#',
    go: 'Go',
    cpp: 'C++'
};

// Zaman secimi icin izin listesi
const explorePeriods = ['all', 'week'];

// Ornek: /api/explore?language=python&period=week&page=2
// Parametre gelmezse varsayilan: tum diller, tum zamanlar, 1. sayfa
app.get('/api/explore', async (req, res) => {
    const language = req.query.language || 'all';
    const period = req.query.period || 'all';
    const page = Number(req.query.page || 1);

    // 1. Izin kontrolu: listede olmayan deger gelirse GitHub'a hic sormadan 400 don
    // Object.hasOwn: sadece nesneye bizim yazdigimiz anahtarlari kabul eder
    if (!Object.hasOwn(exploreLanguages, language) || !explorePeriods.includes(period)) {
        return res.status(400).json({ error: 'Gecersiz dil ya da zaman secimi.' });
    }

    // Sayfa: tam sayi ve 1-10 arasi (10 x 30 = 300 repo yeter; GitHub en fazla 1000 verir)
    if (!Number.isInteger(page) || page < 1 || page > 10) {
        return res.status(400).json({ error: 'Gecersiz sayfa numarasi.' });
    }

    // 2. Arama kosullarini (q) topla; GitHub'da kosullar arada boslukla birlesir
    const conditions = [];

    if (exploreLanguages[language]) {
        // Tirnak icinde: "C#" ve "C++" gibi ozel karakterli adlar bozulmasin
        conditions.push(`language:"${exploreLanguages[language]}"`);
    }

    if (period === 'week') {
        // 7 gun onceki tarih: simdiki zaman - 7 gunun milisaniyesi -> "YYYY-MM-DD"
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        conditions.push(`created:>${weekAgo}`);
    } else {
        // Tum zamanlar: 1000'den az yildizlilari bastan ele (arama hizlanir, q bos kalmaz)
        conditions.push('stars:>1000');
    }

    // 3. Adresi olustur; URLSearchParams bosluk, ", #, + gibi karakterleri URL'ye uygun kodlar
    const params = new URLSearchParams({
        q: conditions.join(' '),
        sort: 'stars',
        order: 'desc',
        per_page: '30',
        page: String(page)
    });

    // 4. Header'lar; token varsa ekle, yoksa (Vercel'de su an) token'siz sor
    // Token'siz "Bearer undefined" gondermek GitHub'da 401 hatasi verir
    const headers = {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'bit-beyin'
    };
    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    try {
        const response = await fetch(`https://api.github.com/search/repositories?${params}`, { headers });

        // Limit dolarsa (403/429) ya da baska hata olursa catch'e git
        if (!response.ok) {
            throw new Error(`GitHub arama cevabi: ${response.status}`);
        }

        const data = await response.json();

        // 5. Her repodan sadece 7 alan al; map her eleman icin yeni bir nesne uretip yeni dizi dondurur
        const repos = data.items.map(repo => ({
            fullName: repo.full_name,
            url: repo.html_url,
            description: repo.description,   // bos olabilir (null) -> sayfada kontrol edilecek
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            pushedAt: repo.pushed_at
        }));

        res.json({ total: data.total_count, page, repos });
    } catch (error) {
        console.error('Kesfet hatasi:', error.message);
        res.status(502).json({ error: 'Projeler su an alinamadi. Biraz sonra tekrar dene.' });
    }
});

// Sunucuyu baslat; hazir olunca konsola yaz
app.listen(PORT, () => {
console.log(`Sunucu calisiyor: http://localhost:${PORT}`);
// Token'in kendisini degil, sadece var mi yok mu bilgisini yaz
console.log('Token yuklendi mi:', Boolean(process.env.GITHUB_TOKEN));
});