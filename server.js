// Express paketini yukle ve uygulamayi olustur
const express = require('express');
const app = express();
const PORT = 5000;

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

// Sunucuyu baslat; hazir olunca konsola yaz
app.listen(PORT, () => {
console.log(`Sunucu calisiyor: http://localhost:${PORT}`);
// Token'in kendisini degil, sadece var mi yok mu bilgisini yaz
console.log('Token yuklendi mi:', Boolean(process.env.GITHUB_TOKEN));
});