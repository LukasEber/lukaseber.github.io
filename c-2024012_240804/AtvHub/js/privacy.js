import { HeaderComponent } from './components/headerComponent.js';

document.addEventListener('DOMContentLoaded', () => {
    const body = document.querySelector('body'); 
    const header = new HeaderComponent(); 

    body.prepend(header.element);  
    
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesButton = document.getElementById('accept-cookies');

    if (!localStorage.getItem('cookiesAccepted')) {
        cookieBanner.classList.remove('hidden');
    }

    acceptCookiesButton?.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieBanner.classList.add('hidden');
    });
});