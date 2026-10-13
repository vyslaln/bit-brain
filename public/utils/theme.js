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
//Deftere YAZMAZ.
function applyTheme(theme) {
    if (theme === 'dark') {
        root.classList.add('dark');
    } else if (theme === 'light') {
        root.classList.remove('dark');
    }
}

//Temayı deftere (localStorage) kaydeder. Ekrana dokunmaz.
function saveTheme(theme) {
    localStorage.setItem('theme', theme);
}


// ===== 3. SAYFA AÇILINCA =====

//Kaydedilen tema 'dark' ise koyu temayı uyguluyoruz. ('light' ise açık tema kalır.)
if (savedTheme === 'dark') {
    applyTheme('dark');
}

//Kaydedilmiş bir tema yoksa (ya da bozuk bir değer varsa), cihazın tercihine bakıyoruz.
//Cihaz koyuysa koyu temayı uyguluyoruz. Deftere YAZMIYORUZ: defteri sadece kullanıcı doldurur.
if (savedTheme === null || (savedTheme !== 'dark' && savedTheme !== 'light')) {
    if (prefersDark) {
        applyTheme('dark');
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