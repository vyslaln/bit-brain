//Burada sunucudan gelen veriyi okuyacak bir fetch fonksiyonu yazılacak.
async function fetchGitHubData() {
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

        data.repos.forEach(repo => {
            //Her repoya yeni bir kart 
            const repoCard = document.createElement('article');
            repoCard.classList.add('card', 'category-card', 'flex', 'flex-col', 'gap-3');
            console.log(repo);

            //Başlık bölümü
            const fullName = document.createElement('h2');
            fullName.classList.add('card-title');

            //Başlığın link bölümü
            const link = document.createElement('a');
            link.classList.add('hover:text-primary');

            link.href = repo.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = repo.fullName;
            
            fullName.appendChild(link);
            repoCard.appendChild(fullName);

            repoList.appendChild(repoCard);
        });
        
        return data;
    }
    catch (error) {
        console.error('Github sunucusundan repository verisi çekilemedi:', error);
    };

};

fetchGitHubData()