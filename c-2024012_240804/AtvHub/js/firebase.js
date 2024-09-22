import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-storage.js";  

const firebaseConfig = {
    apiKey: "AIzaSyCbqcuD0444hwOnSC4anpU0-5heLNiXFJ8",
    authDomain: "atv-hub-f08c3.firebaseapp.com",
    projectId: "atv-hub-f08c3",
    storageBucket: "atv-hub-f08c3.appspot.com",
    messagingSenderId: "953769081517",
    appId: "1:953769081517:web:bda6d2426e73c4e3e76424"
  };
  

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
