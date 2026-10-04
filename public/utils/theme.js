//Burada dark mod için, index.html içerisine eklediğimiz butonu tanıtıyoruz.
const themeToggle = document.getElementById('theme-toggle');

//Burada root tanımı bize şunu söylüyor : root = document.documentElement yani html elementini temsil ediyor. 
// Bu sayede dark mod için gerekli olan sınıfları html elementine ekleyip çıkarabiliyoruz.
const root = document.documentElement;

//Burada localStorage'dan kaydedilmiş temayı alıyoruz. 
//Eğer daha önce bir tema seçilmişse, bu tema burada saklanır ve sayfa yüklendiğinde uygulanır.
const savedTheme = localStorage.getItem('theme');

//Kaydedilen tema 'dark' ise <html>'e .dark sınıfını ekliyoruz. ('light' ya da boşsa açık tema kalır.)
if(savedTheme === 'dark'){
    root.classList.add('dark');
} 

//Burada artık butonumuza tıklama olayını ekliyoruz. 
//Butona tıklandığında, mevcut temayı kontrol ediyoruz ve değiştiriyoruz.
themeToggle.addEventListener('click', function(){

    //Eğer .dark sınıfı varsa, yani şu an dark mod aktifse, bu sınıfı kaldırıyoruz ve localStorage'da 'light' olarak kaydediyoruz.
    if(root.classList.contains('dark')){
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        
        //Eğer .dark sınıfı yoksa, yani şu an light mod aktifse, bu sınıfı ekliyoruz ve localStorage'da 'dark' olarak kaydediyoruz.
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
});