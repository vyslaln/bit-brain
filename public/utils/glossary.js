//Bu dosyada terms.json'daki verileri fetch edip, kart olarak ekrana basıyoruz.

//Terms divini (raf) buluyoruz.
const termsContainer = document.getElementById('terms');

//Tüm terimleri tutan ortak kutu (koridor). Başta boş, veri gelince dolacak.
let allTerms = [];

//✱ Yazıyı aranabilir hâle getirir: Türkçe kurala göre küçültür, ı'ları i yapar.
//Böylece "API" ile "api", "IŞIK" ile "ışık" eşleşir.
function normalize(text) {
    return text.toLocaleLowerCase('tr').replaceAll('ı', 'i');
}

//Verilen listeyi kart olarak rafa dizer. Arama ve seviye butonları da bunu kullanacak.
function renderTerms(list) {
    //Önce rafı boşaltıyoruz, yoksa yeni kartlar eskilerin sonuna eklenir.
    termsContainer.textContent = '';

    list.forEach(function (item) {
        //Kartın kendisi
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

//Veriyi (koliyi) getirir, koridora koyar ve renderTerms'e (rafçıya) verir.
async function loadTerms() {
    const response = await fetch('../data/terms.json');
    const terms = await response.json();
    allTerms = terms;
    renderTerms(terms);
}

loadTerms();

//Arama kutusunu buluyoruz.
const searchBar = document.getElementById('search-bar');

//Kutuya her harf yazıldığında (input olayı) çalışır.
searchBar.addEventListener('input', function () {
    //✱ Kullanıcının yazdığını aranabilir hâle getiriyoruz.
    const query = normalize(searchBar.value);

    //Elek: Adı aranan yazıyı içeren terimler kalır, diğerleri elenir.
    const filtered = allTerms.filter(function (item) {
        return normalize(item.term).includes(query); //✱
    });

    //Elekten geçenleri rafa diziyoruz.
    renderTerms(filtered);
});