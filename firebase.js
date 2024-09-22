import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js';


const firebaseConfig = {
  apiKey: "AIzaSyBVnaEvlT7tffdhXTvqGxxHUG-dxBHHeO4",
  authDomain: "lukas-eber-demo-projects.firebaseapp.com",
  projectId: "lukas-eber-demo-projects",
  storageBucket: "lukas-eber-demo-projects.appspot.com",
  messagingSenderId: "974097391602",
  appId: "1:974097391602:web:061587e3917bb12e21156b"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };