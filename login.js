import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js';
import { auth } from './firebase.js';

const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            window.location.href = '/index.html';
        })
        .catch(() => {
            const errorMessage = document.getElementById('errorMessage');
            errorMessage.textContent = "Login fehlgeschlagen. Bitte E-Mail und Passwort prüfen.";
            errorMessage.classList.remove('hidden');
        });
});