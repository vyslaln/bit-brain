//Burada footer'da yazan yılı otomatik olarak güncellemek için bir fonksiyon oluşturuyoruz

//İlk başta footer'da bulunan yılı tutan span'ı buluyoruz ve bir değişkene atıyoruz
const footerYear = document.getElementById('footer-year');

//Şu anki yılı alıyoruz
const currentYear = new Date().getFullYear();

//Footer'daki yılı güncelliyoruz
footerYear.textContent = currentYear;