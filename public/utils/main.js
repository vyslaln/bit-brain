//Burada footer'da yazan yılı otomatik olarak güncellemek için bir fonksiyon oluşturuyoruz

//İlk başta footer'da bulunan yılı tutan span'ı buluyoruz ve bir değişkene atıyoruz
const footerYear = document.getElementById('footer-year');

//Şu anki yılı alıyoruz
const currentYear = new Date().getFullYear();

//Footer'daki yılı güncelliyoruz
footerYear.textContent = currentYear;

//Burada artık hamburger menüyü yazacağız.

//Buraya hamburger menü için gerekli değişken tanımlamalarını yapacağız.
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

// Butona tıklanınca menüyü aç / kapat
menuToggle.addEventListener('click', function () {
    mobileMenu.classList.toggle('hidden');

    // Menü şu an kapalı mı? (hidden varsa kapalı)
    const isHidden = mobileMenu.classList.contains('hidden');

    // Duruma göre butonun simgesini değiştir
if (isHidden) {
menuToggle.textContent = '☰';
menuToggle.setAttribute('aria-expanded', 'false');
menuToggle.setAttribute('aria-label', 'Menüyü aç.');
} else {
menuToggle.textContent = '✕';
menuToggle.setAttribute('aria-expanded', 'true');
menuToggle.setAttribute('aria-label', 'Menüyü kapat.');
}
});