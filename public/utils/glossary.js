//Bu dosyada terms.json'daki verileri fetch edip, kart olarak ekrana basıyoruz.

//Terms divini (raf) buluyoruz.
const termsContainer = document.getElementById('terms');

//Tüm terimleri tutan ortak kutu (koridor). Başta boş, veri gelince dolacak.
let allTerms = [];

//Seçili seviye butonu. Başta 'all' (hepsi); butona basılınca değişir.
let currentLevel = 'all';

//Yazıyı aranabilir hâle getirir: Türkçe kurala göre küçültür, ı'ları i yapar.
//Böylece "API" ile "api", "IŞIK" ile "ışık" eşleşir.
function normalize(text) {
    return text.toLocaleLowerCase('tr').replaceAll('ı', 'i');
}

//Verilen listeyi kart olarak rafa dizer. Arama ve seviye butonları da bunu kullanacak.
function renderTerms(list) {
    //Önce rafı boşaltıyoruz, yoksa yeni kartlar eskilerin sonuna eklenir.
    termsContainer.textContent = '';

    //Liste boşsa mesaj göster ve çık (forEach'e gerek yok).
    if (list.length === 0) {
        const message = document.createElement('p');
        message.textContent = 'Aradığın sonuç bulunamadı.';
        termsContainer.appendChild(message);
        return;
    }

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

//Ekranı yeniler: iki eleği çalıştırır, sonucu rafa dizer.
//Hem arama kutusu hem seviye butonları bunu çağırır.
function applyFilters() {
    //Kullanıcının yazdığını aranabilir hâle getiriyoruz.
    const query = normalize(searchBar.value);

    //İki elek: Terim hem seçili seviyede hem de adı aranan yazıyı içeriyorsa kalır.
    const filtered = allTerms.filter(function (item) {
        const matchesLevel = currentLevel === 'all' || currentLevel === item.level; //seviye eleği
        const matchesSearch = normalize(item.term).includes(query);               //arama eleği
        return matchesLevel && matchesSearch;
    });

    //Elekten geçenleri rafa diziyoruz.
    renderTerms(filtered);
}

//Kutuya her harf yazıldığında (input olayı) ekranı yenile.
searchBar.addEventListener('input', applyFilters);

//Seviye butonlarını buluyoruz (4 tane).
const levelButtons = document.querySelectorAll('#level-buttons button');

//Her butona tıklama dinleyicisi ekliyoruz.
levelButtons.forEach(function (button) {
    button.addEventListener('click', function () {
        //Butonun data-level değerini seçili seviye yapıyoruz.
        currentLevel = button.dataset.level;
        //Ekranı yeni seviyeye göre yeniliyoruz (şimdi çalıştır: parantezli).
        applyFilters();
    });
});

/*
=== HATALI KOD (22.10, ögrenme notu) ===
Hata: Dinleyici (ve searchBar) applyFilters'in ICINE alinmisti.
Sonuc: Dinleyici ancak biri applyFilters()'i cagirinca kurulur;
kimse cagirmadigi icin arama hic calismaz.
Dogrusu: Fonksiyon sadece "elek + rafa diz" isini yapar,
dinleyici DISARIDA kalir ve fonksiyonu cagirir.

function applyFilters(){
    //Arama kutusunu buluyoruz.
const searchBar = document.getElementById('search-bar');

//Kutuya her harf yazıldığında (input olayı) çalışır.
searchBar.addEventListener('input', function () {
    //Kullanıcının yazdığını aranabilir hâle getiriyoruz.
    const query = normalize(searchBar.value);

    //İki elek: Terim hem seçili seviyede hem de adı aranan yazıyı içeriyorsa kalır.
    const filtered = allTerms.filter(function (item) {
        const matchesLevel = currentLevel === 'all' || currentLevel === item.level; //seviye eleği
        const matchesSearch = normalize(item.term).includes(query);               //arama eleği
        return matchesLevel && matchesSearch;
    });

    //Elekten geçenleri rafa diziyoruz.
    renderTerms(filtered);
});
}
*/
