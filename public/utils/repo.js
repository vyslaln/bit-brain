//Repo detay sayfası: adresteki ?repo=sahip/ad değerini okuyup /api/repo'dan gelen bilgilerle sayfayı doldurur

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

        //sunucu hata döndürdüyse catch'e git
        if (!response.ok) {
            throw new Error(`Repo alınamadı: ${response.status}`);
        }

        //cevabı JSON'a çevir ve şimdilik konsola yaz
        const repo = await response.json();
        console.log(repo);
    } catch (error) {
        //hatayı konsola yaz, sayfaya sade bir mesaj göster
        console.error('Repo hatası:', error);
        repoStatus.textContent = 'Repo bilgisi şu an alınamıyor.';
    }
}

loadRepo();
