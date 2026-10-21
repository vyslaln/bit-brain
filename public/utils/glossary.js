//Bu sayfada artık terms.json dosyasının içerisindeki verileri fetch edip, okuyoruz.

//Burada terms divini buluyoruz.
const termsContainer = document.getElementById('terms');

//Burada okumamızı sağlayan fonksiyonu yazıyoruz, aynı zamanda o fonksiyonun içerisine bir forEach döngüsü ekleyerek ekrana basıyoruz.
async function loadTerms() {
    const response = await fetch('../data/terms.json');
    const terms = await response.json();
    terms.forEach(function(item){
        
        //Burada kartın genel yapısını kuruyoruz.
        const card = document.createElement('article');
        
        //Burada kartın başlığını yazıyoruz
        const title = document.createElement('h2');

        //title değişkeninin içeriğini değiştiriyoruz.
        title.textContent = item.term;

        //Burada kartın açıklamasını tutuyoruz
        const description = document.createElement('p');

        //Burada description'un içeriğini değiştiriyoruz.
        description.textContent = item.definition;

        //Burada artık kartın içerisinde yazan kavramın seviyesini tanıtıyoruz.
        const level = document.createElement('span');

        //Burada level'in içeriğini değiştiriyoruz.
        level.textContent = item.level;

        //Burada ise bu üç özelliği kartın içerisine tanımlıyoruz.
        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(level);

        termsContainer.appendChild(card);
    });
}

loadTerms();