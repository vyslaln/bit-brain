//Repo detay sayfası: adresteki ?repo=sahip/ad değerini okuyup /api/repo'dan gelen bilgilerle sayfayı doldurur

//Sayfa açılınca çalışacak ana fonksiyon
function loadRepo() {
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

    //şimdilik sadece konsolda göster
    console.log(repoName);
}

loadRepo();
