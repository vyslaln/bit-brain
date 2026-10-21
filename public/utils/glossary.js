//Bu dosyada terms.json'daki verileri fetch edip, kart olarak ekrana basıyoruz.

//Burada terms divini (raf) buluyoruz.
const termsContainer = document.getElementById('terms');

//Verilen listeyi kart olarak rafa dizer. Arama ve seviye butonları da bunu kullanacak.
function renderTerms(list) {
    //Önce rafı boşaltıyoruz.
    termsContainer.textContent = '';

    list.forEach(function (item) {
        //Burada kartın genel yapısını kuruyoruz.
        const card = document.createElement('article');

        //Kartın başlığı
        const title = document.createElement('h2');
        title.textContent = item.term;

        //Kartın açıklaması
        const description = document.createElement('p');
        description.textContent = item.definition;

        //Kavramın seviyesi
        const level = document.createElement('span');
        level.textContent = item.level;

        //Üç parçayı kartın içine, kartı rafa ekliyoruz.
        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(level);
        termsContainer.appendChild(card);
    });
}

//Veriyi (koliyi) getirir ve renderTerms'e (rafçıya) verir.
async function loadTerms() {
    const response = await fetch('../data/terms.json');
    const terms = await response.json();
    renderTerms(terms);
}

loadTerms();