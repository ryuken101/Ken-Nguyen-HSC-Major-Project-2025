import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase config (same as your stats.js)
const firebaseConfig = {
    apiKey: "AIzaSyAUU2wXBEWT8c-6pOS2iyEjvgQlGzmolRo",
    authDomain: "purrsue-login.firebaseapp.com",
    projectId: "purrsue-login",
    storageBucket: "purrsue-login.appspot.com",
    messagingSenderId: "329901830629",
    appId: "1:329901830629:web:ba907e54131d88ea21bf0c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to find the field with the lowest stat 
function getLowestStat(statsData) {
    const stats = {
        study: statsData.study || 0,
        physical: statsData.physical || 0,
        sleep: statsData.sleep || 0,
        mental: statsData.mental || 0,
        leisure: statsData.leisure || 0
    };
    
    // Convert to array and sort by value
    const sortedStats = Object.entries(stats)
        .sort((a, b) => a[1] - b[1]);
    
    // Return the stat with lowest value
    return {
        stat: sortedStats[0][0],
        value: sortedStats[0][1]
    };
}

// Function to show modal notification for the lowest stat
function showLowStatNotification(lowestStatInfo) {
    if (!lowestStatInfo) return;
    
    let modalContainer = document.getElementById('modal-container');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'modal-container';
        document.body.appendChild(modalContainer);
    }
    
    const statNames = {
        study: 'Study',
        physical: 'Physical Health',
        sleep: 'Sleep',
        mental: 'Mental Health',
        leisure: 'Leisure'
    };
    
    modalContainer.innerHTML = `
        <div class="low-stat-modal">
            <h3>Your pet is concerned! <i class='bx bx-heart-circle'></i></h3>
            <p>Your ${statNames[lowestStatInfo.stat]} stat is getting low (${lowestStatInfo.value} points).</p>
            <p>Consider completing some tasks in this category to improve your balance!</p>
            <img src="Animation/kitten-cry.gif" alt="sprite animation" width="200" height="200">
            <button id="close-modal">OK, I'll work on it!</button>
        </div>
        <div class="modal-overlay"></div>
    `;
    
    // Add close handler
    document.getElementById('close-modal').addEventListener('click', () => {
        closeModal(modalContainer);
    });
    
    // Close when clicking outside
    document.querySelector('.modal-overlay').addEventListener('click', () => {
        closeModal(modalContainer);
    });
}

function closeModal(modalContainer) {
    modalContainer.classList.add('modal-exit');
    setTimeout(() => {
        modalContainer.remove();
    }, 300); 
}

// Main function to check stats and show notification
async function checkStatsForPetPage() {
    if (!auth.currentUser) return;
    
    const userStatsRef = doc(db, "users", auth.currentUser.uid, "data", "stats");
    
    try {
        const docSnap = await getDoc(userStatsRef);
        if (docSnap.exists()) {
            const statsData = docSnap.data();
            const lowestStat = getLowestStat(statsData);
            showLowStatNotification(lowestStat);
        }
    } catch (error) {
        console.error("Error checking stats:", error);
    }
}

// Set up real-time listener for stats updates
function setupPetStatsListener() {
    if (!auth.currentUser) return;
    
    const userStatsRef = doc(db, "users", auth.currentUser.uid, "data", "stats");
    
    onSnapshot(userStatsRef, (doc) => {
        if (doc.exists()) {
            const statsData = doc.data();
            const lowestStat = getLowestStat(statsData);
            showLowStatNotification(lowestStat);
        }
    });
}

// Initialize when the pet page loads
document.addEventListener('DOMContentLoaded', () => {
    // Only run on pet.html
    if (!window.location.pathname.includes('pet.html')) return;
    
    onAuthStateChanged(auth, (user) => {
        if (user) {
            checkStatsForPetPage();
            setupPetStatsListener();
        }
    });
});