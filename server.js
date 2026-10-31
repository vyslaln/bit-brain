// Express paketini yukle ve uygulamayi olustur
const express = require('express');
const app = express();
const PORT = 5000;

// .env dosyasini process.env'e yukle (her seyden once)
// Token asla console.log'a yazilmaz
const { loadEnvFile } = require('node:process');
loadEnvFile();

// public klasorundeki html, css, js dosyalarini oldugu gibi sun
// (.env ve server.js kok klasorde oldugu icin disariya acilmaz)
app.use(express.static('public'));

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

// Sunucuyu baslat; hazir olunca konsola yaz
app.listen(PORT, () => {
console.log(`Sunucu calisiyor: http://localhost:${PORT}`);
// Token'in kendisini degil, sadece var mi yok mu bilgisini yaz
console.log('Token yuklendi mi:', Boolean(process.env.GITHUB_TOKEN));
});