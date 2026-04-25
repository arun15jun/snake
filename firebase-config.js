import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "games-90458.firebaseapp.com",
  projectId: "games-90458",
  storageBucket: "games-90458.firebasestorage.app",
  messagingSenderId: "494105332165",
  appId: "1:494105332165:web:7435aa9dd52114cc92e3ac"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
