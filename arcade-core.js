// Neon Arcade Core - Global Firebase & Leaderboard Logic
// This file is designed for maximum compatibility with Safari and Chrome

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBGEJkvoU2s7s05Cs16r9GorERUxNOLsZ4",
  authDomain: "games-90458.firebaseapp.com",
  projectId: "games-90458",
  storageBucket: "games-90458.firebasestorage.app",
  messagingSenderId: "494105332165",
  appId: "1:494105332165:web:7435aa9dd52114cc92e3ac"
};

// Initialize
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global Arcade Object
window.NeonArcade = {
    auth: auth,
    db: db,
    user: null,
    
    async saveHighScore(gameName, score) {
        if (!this.user) return;
        const scoresRef = doc(this.db, 'scores', this.user.uid);
        try {
            const docSnap = await getDoc(scoresRef);
            if (!docSnap.exists()) {
                await setDoc(scoresRef, {
                    [gameName]: score,
                    email: this.user.email,
                    username: this.user.email.split('@')[0]
                });
            } else {
                const currentBest = docSnap.data()[gameName] || 0;
                if (score > currentBest) {
                    await updateDoc(scoresRef, { [gameName]: score });
                }
            }
        } catch (e) { console.error("Cloud save failed:", e); }
    },

    logout() {
        if (confirm("Logout of Neon Arcade?")) {
            signOut(this.auth).then(() => window.location.reload());
        }
    }
};

// Track Auth State
onAuthStateChanged(auth, (user) => {
    window.NeonArcade.user = user;
    // Update UI if login button exists
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn && user) {
        loginBtn.textContent = user.email.split('@')[0].toUpperCase();
        loginBtn.href = "#";
        loginBtn.onclick = () => window.NeonArcade.logout();
    }
});
