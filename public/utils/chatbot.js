//Ana sayfadaki demo sohbet penceresini çalıştırmak. Kullanıcı bir soru yazıp gönderince, 
// sorusu balon olarak eklenir ve kısa bir beklemeden sonra sabit bir demo cevabı gelir. 
// Gerçek yapay zekâ yok. İleride Express sunucusuna bağlanacak.

//Form, yazı kutusu ve mesaj alanını bul
const chatbotForm = document.getElementById('chatbot-form');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotMessages = document.getElementById('chatbot-messages');

//Form gönderilince sayfanın yenilenmesini durdur
chatbotForm.addEventListener('submit', function(event){
    // Sayfanın yenilenmesini durdur
    event.preventDefault(); 
    
    //Kullanıcının mesajını al
    const userMessage = chatbotInput.value.trim();
    
    //Eğer mesaj boş ise;
    if(userMessage === '') return; //Boş mesaj gönderilmesini engelle

    //Kullanıcının mesajını ekle
    const userMessageElement = document.createElement('p');
    userMessageElement.className = 'self-end max-w-[80%] bg-primary text-white px-4 py-2 text-sm rounded-lg';
    userMessageElement.textContent = userMessage;
    chatbotMessages.appendChild(userMessageElement);

    chatbotInput.value = ''; //Yazı kutusunu temizle
});