//Burada sunucudan gelen veriyi okuyacak bir fetch fonksiyonu yazılacak.
async function fetchGitHubData() {
    //burada proje durumunu gösteriyoruz sayı/boş/dolu
    const exploreStatus = document.getElementById('explore-status');

    try{
        //sunucuya sor
        const response = await fetch('/api/explore');

        //sunucu hata döndürdüyse catch bloğuna git
        if(!response.ok){
            throw new Error(`Repo Cekilemedi: ${response.status}`);
        }

        //cevap json'a döner
        const data = await response.json();

        //Repoları ekrana bas
        const repoList = document.getElementById('repo-list');

        if(data.repos.length === 0){
            exploreStatus.textContent = 'Github içerisinde repo bulunamadı';
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

        //kaç tane repo gösterildiğini ekrana basıyoruz
        exploreStatus.textContent = `${data.repos.length} Proje Gösteriliyor`; 

    }
    catch (error) {
        console.error('Github sunucusundan repository verisi çekilemedi:', error);
        exploreStatus.textContent = 'Meydana gelen bir problemden dolayı şu anda bilgiler alınamıyor';
    };

};

fetchGitHubData()