import { db, auth } from '../firebase-config.js';
import { doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export async function saveHighScore(gameName, score) {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const scoresRef = doc(db, 'scores', user.uid);

    try {
        const docSnap = await getDoc(scoresRef);
        
        if (!docSnap.exists()) {
            // First time saving
            await setDoc(scoresRef, {
                [gameName]: score,
                email: user.email,
                username: user.email.split('@')[0]
            });
        } else {
            const currentBest = docSnap.data()[gameName] || 0;
            if (score > currentBest) {
                await updateDoc(scoresRef, {
                    [gameName]: score
                });
            }
        }
    } catch (error) {
        console.error("Error saving score: ", error);
    }
}
