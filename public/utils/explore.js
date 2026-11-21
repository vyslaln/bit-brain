//şu an seçili dil ve zaman; sayfa açıkken hatırlanır, tıklamalarla değişir
let currentLanguage = 'all';
let currentPeriod = 'all';
//şu an kaçıncı sayfadayız; ilk açılışta 1, "Daha fazla göster" ile artar, filtre değişince 1'e döner
let currentPage = 1;

//Burada sunucudan gelen veriyi okuyacak bir fetch fonksiyonu yazılacak.
//language ve period: hangi dil ve zaman isteniyor; boş çağrılırsa ikisi de 'all' (tümü)
//page: kaçıncı sayfa; 1 ise liste sıfırdan kurulur, 1'den büyükse kartlar listenin sonuna eklenir
async function fetchGitHubData(language = 'all', period = 'all', page = 1) {
    //burada proje durumunu gösteriyoruz sayı/boş/dolu
    const exploreStatus = document.getElementById('explore-status');
    //daha fazla göster butonu (son sayfada gizlenecek)
    const loadMore = document.getElementById('load-more');

    try{
        //sunucuya sor: seçilen dil ve zaman adresin ? sonrasına eklenir
        const response = await fetch(`/api/explore?language=${language}&period=${period}&page=${page}`);

        //sunucu hata döndürdüyse catch bloğuna git
        if(!response.ok){
            throw new Error(`Repo Cekilemedi: ${response.status}`);
        }

        //cevap json'a döner
        const data = await response.json();

        //Repoları ekrana bas
        const repoList = document.getElementById('repo-list');

        //yeni bir arama (1. sayfa) ise eski kartları temizle; "daha fazla göster"de eskiler kalır
        if(page === 1){
            repoList.replaceChildren();
        }

        if(data.repos.length === 0){
            //1. sayfada hiç sonuç yoksa mesaj göster; sonraki sayfalarda eski kartlar ve mesaj kalsın
            if(page === 1){
                exploreStatus.textContent = 'Github içerisinde repo bulunamadı';
            }
            loadMore.hidden = true;
            return;
        }

        data.repos.forEach(repo => {
            //Her repoya yeni bir kart 
            const repoCard = document.createElement('article');
            repoCard.classList.add('card', 'category-card', 'flex', 'flex-col', 'gap-3');

            //Başlık bölümü
            const title = document.createElement('h2');
            title.classList.add('card-title', 'break-words');

            //Başlığın link bölümü
            const link = document.createElement('a');
            link.classList.add('hover:text-primary');

            link.href = repo.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = repo.fullName;
            
            title.appendChild(link);
            repoCard.appendChild(title);

            //açıklama bölümü
            const description = document.createElement('p');
            description.classList.add('card-text');
            description.textContent = repo.description || 'Bu reponun açıklaması bulunamadı.';
            repoCard.appendChild(description);

            //dil ve level badge bölümü
            const languageBox = document.createElement('div');
            languageBox.classList.add('flex', 'flex-wrap', 'gap-2');

            const levelBadge = document.createElement('span');
            levelBadge.classList.add('level-badge', 'mt-0');
            levelBadge.textContent = repo.language || 'Bilinmiyor';
            languageBox.appendChild(levelBadge);
            repoCard.appendChild(languageBox);

            //star, fork ve update bölümü
            const info = document.createElement('ul');
            info.classList.add('flex', 'flex-wrap', 'gap-4', 'text-sm', 'mt-auto');

            const stars = document.createElement('li');
            const forks = document.createElement('li');
            const updated = document.createElement('li');

            stars.textContent = `⭐ ${repo.stars.toLocaleString('tr-TR')}`;
            forks.textContent = `🍴 ${repo.forks.toLocaleString('tr-TR')}`;
            updated.textContent = `🕒 ${new Date(repo.pushedAt).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            })}`;

            info.appendChild(stars);
            info.appendChild(forks);
            info.appendChild(updated);

            repoCard.appendChild(info);

            repoList.appendChild(repoCard);
        });

        //kaç tane repo gösterildiğini ekrana basıyoruz (ekranda toplam kaç kart varsa)
        exploreStatus.textContent = `${repoList.children.length} Proje Gösteriliyor`;

        //30'dan az geldiyse ya da 10. sayfaya geldiysek (sunucunun sınırı) başka sayfa yok: butonu gizle
        loadMore.hidden = data.repos.length < 30 || page >= 10;

    }
    catch (error) {
        console.error('Github sunucusundan repository verisi çekilemedi:', error);
        exploreStatus.textContent = 'Meydana gelen bir problemden dolayı şu anda bilgiler alınamıyor';
    };

};

fetchGitHubData()

//dil butonlarının kutusu
const languageButtons = document.getElementById('language-buttons');

//kutuya tek bir tıklama dinleyicisi, hangi butona basıldığını event.target söyler
languageButtons.addEventListener('click', (event) => {
    //butonların arasındaki boşluğa tıklandıysa (data-language yoksa) çık
    if(!event.target.dataset.language){
        return;
    }

    //yeşil (active) sınıfını önce bütün butonlardan sil, sonra sadece tıklanana ekle
    languageButtons.querySelectorAll('button').forEach(button => {
        button.classList.remove('active');
    });
    event.target.classList.add('active');

    //seçili dili hatırla (zaman kutusu da bunu kullanacak)
    currentLanguage = event.target.dataset.language;

    //yeni filtre = yeni arama, sayfayı başa al
    currentPage = 1;

    //seçili dil ve zamanla repoları yeniden iste
    fetchGitHubData(currentLanguage, currentPeriod, currentPage);
});

//zaman seçim kutusu
const periodSelect = document.getElementById('period-select');

//seçim değişince (change) yeni zamanı hatırla ve repoları yeniden iste
periodSelect.addEventListener('change', (event) => {
    //seçilen zamanı hatırla ('all' ya da 'week')
    currentPeriod = event.target.value;

    //yeni filtre = yeni arama, sayfayı başa al
    currentPage = 1;

    //seçili dil ve zamanla repoları yeniden iste
    fetchGitHubData(currentLanguage, currentPeriod, currentPage);
});

//daha fazla göster butonu
const loadMoreButton = document.getElementById('load-more');

//butona basınca bir sonraki sayfayı iste; kartlar eskilerin altına eklenir
loadMoreButton.addEventListener('click', () => {
    //bir sonraki sayfaya geç
    currentPage += 1;

    //aynı dil ve zamanla yeni sayfayı iste
    fetchGitHubData(currentLanguage, currentPeriod, currentPage);
});
