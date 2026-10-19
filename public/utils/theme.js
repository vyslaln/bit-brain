// ===== 1. DEĞİŞKENLER =====

//Burada dark mod için, index.html içerisine eklediğimiz butonu tanıtıyoruz.
const themeToggle = document.getElementById('theme-toggle');

//root = document.documentElement yani html elementini temsil ediyor.
//Dark mod için gerekli olan sınıfı html elementine ekleyip çıkarabiliyoruz.
const root = document.documentElement;

//Burada localStorage'dan (defterden) kaydedilmiş temayı okuyoruz.
const savedTheme = localStorage.getItem('theme');

//Cihazın koyu temayı tercih edip etmediğini soruyoruz (true / false).
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;


// ===== 2. FONKSİYONLAR (aletler) =====

//Temayı ekrana uygular: <html>'e .dark sınıfını ekler ya da çıkarır.
//Butonun simgesini ve etiketini de günceller. Deftere YAZMAZ.
function applyTheme(theme) {
    if (theme === 'dark') {
        root.classList.add('dark');
        themeToggle.textContent = '☀️';
        themeToggle.setAttribute('aria-label', 'Açık temaya geç.');
    } else if (theme === 'light') {
        root.classList.remove('dark');
        themeToggle.textContent = '🌙';
        themeToggle.setAttribute('aria-label', 'Koyu temaya geç.');
    }
}

//Temayı deftere (localStorage) kaydeder. Ekrana dokunmaz.
function saveTheme(theme) {
    localStorage.setItem('theme', theme);
}


// ===== 3. SAYFA AÇILINCA =====
//applyTheme her durumda çağrılmalı: tema ile birlikte butonun simgesi ve etiketi de ayarlanıyor.

//Deftere kaydedilmiş bir tema varsa onu uyguluyoruz.
if (savedTheme === 'dark') {
    applyTheme('dark');
} else if (savedTheme === 'light') {
    applyTheme('light');
}

//Kaydedilmiş bir tema yoksa (ya da bozuk bir değer varsa), cihazın tercihine bakıyoruz.
//Deftere YAZMIYORUZ: defteri sadece kullanıcı doldurur.
if (savedTheme === null || (savedTheme !== 'dark' && savedTheme !== 'light')) {
    if (prefersDark) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }
}


// ===== 4. DÜĞMEYE BASILINCA =====

//Kullanıcı düğmeye basınca: şu anki temanın tersini uygula ve deftere kaydet.
themeToggle.addEventListener('click', function () {
    if (root.classList.contains('dark')) {
        applyTheme('light');
        saveTheme('light');
    } else {
        applyTheme('dark');
        saveTheme('dark');
    }
});