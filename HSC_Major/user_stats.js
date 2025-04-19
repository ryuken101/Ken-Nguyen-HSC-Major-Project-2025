import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your Firebase config (same as in your login page)
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

// Wait for DOM to load and user to be authenticated
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await loadAndRenderStats();
            setupRealTimeUpdates();
        } else {
            window.location.href = 'index.html';
        }
    });
});

async function loadAndRenderStats() {
    const userStatsRef = doc(db, "users", auth.currentUser.uid, "data", "stats");
    
    try {
        const docSnap = await getDoc(userStatsRef);
        const statsData = docSnap.exists() ? docSnap.data() : {
            study: 0,
            physical: 0,
            sleep: 0,
            mental: 0,
            leisure: 0
        };
        
        renderRadarChart(statsData);
    } catch (error) {
        console.error("Error loading stats:", error);
        // Render with default values if there's an error
        renderRadarChart({
            study: 0,
            physical: 0,
            sleep: 0,
            mental: 0,
            leisure: 0
        });
    }
}

function renderRadarChart(statsData) {
    const chart = document.getElementById('user_stats');
    
    // Destroy previous chart if it exists
    if (chart.chart) {
        chart.chart.destroy();
    }
    
    chart.chart = new Chart(chart, {
        type: 'radar',
        data: {
            labels: ['Study', 'Physical Health', 'Sleep', 'Mental Health', 'Leisure'],
            datasets: [{
                label: 'Completed Tasks',
                data: [
                    statsData.study || 0,
                    statsData.physical || 0,
                    statsData.sleep || 0,
                    statsData.mental || 0,
                    statsData.leisure || 0
                ],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointRadius: 4
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: Math.max(
                        10, 
                        ...Object.values(statsData).map(val => typeof val === 'number' ? val : 0)
                    ) + 5
                }
            }
        }
    });
}

function setupRealTimeUpdates() {
    const userStatsRef = doc(db, "users", auth.currentUser.uid, "data", "stats");
    
    onSnapshot(userStatsRef, (doc) => {
        if (doc.exists()) {
            const statsData = doc.data();
            renderRadarChart(statsData);
        }
    });
}I