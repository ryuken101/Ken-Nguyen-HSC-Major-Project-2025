import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc,
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase config
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

// Chart instance variable
let radarChart = null;
let doughnutChart = null;

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await initializeUserStats();
            await loadAndRenderStats();
            setupRealTimeUpdates();
        } else {
            window.location.href = 'index.html';
        }
    });
});

// Initialize stats document if it doesn't exist
async function initializeUserStats() {
    if (!auth.currentUser) return;
    
    const userStatsRef = doc(db, "users", auth.currentUser.uid, "data", "stats");
    
    try {
        const docSnap = await getDoc(userStatsRef);
        if (!docSnap.exists()) {
            await setDoc(userStatsRef, {
                study: 0,
                physical: 0,
                sleep: 0,
                mental: 0,
                leisure: 0
            });
        }
    } catch (error) {
        console.error("Error initializing stats:", error);
    }
}


async function loadAndRenderStats() {
    if (!auth.currentUser) return;
    
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
        renderdoughnutChart(statsData);
    } catch (error) {
        console.error("Error loading stats:", error);
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
    const ctx = document.getElementById('user_stats').getContext('2d');
    
    // Destroy previous chart if it exists
    if (radarChart) {
        radarChart.destroy();
    }
    
    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: 
            ['Study', 'Physical Health', 'Sleep', 'Mental Health', 'Leisure'],
            datasets: [{
                label: 'Stat Point',
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
                pointRadius: 4,

                
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: Math.max(
                        10, 
                        ...Object.values(statsData).map(val => typeof val === 'number' ? val : 0)
                    ) + 2
                }
            },
            
            
        }
    });
}



function setupRealTimeUpdates() {
    if (!auth.currentUser) return;
    
    const userStatsRef = doc(db, "users", auth.currentUser.uid, "data", "stats");
    
    onSnapshot(userStatsRef, (doc) => {
        if (doc.exists()) {
            const statsData = doc.data();
            renderRadarChart(statsData);
            renderdoughnutChart(statsData);
        }
    });
}

function renderdoughnutChart(statsData) {
    const ctx = document.getElementById('doughnut_chart').getContext('2d');

    // Destroy previous chart if it exists
    if (doughnutChart) {
        doughnutChart.destroy();
    }

    if (doughnutChart = null) {
        console.log('HHUHHH');
    }

    doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Study', 'Physical Health', 'Sleep', 'Mental Health', 'Leisure'],
            datasets: [{
                data: [
                    statsData.study || 0,
                    statsData.physical || 0,
                    statsData.sleep || 0,
                    statsData.mental || 0,
                    statsData.leisure || 0
                ],
                backgroundColor: [
                    'rgba(170,185,223, 0.7)',
                    'rgba(188, 230, 156, 0.7)',
                    'rgba(211, 171, 215, 0.7)',
                    'rgba(145, 214, 213, 0.7)',
                    'rgba(255, 237, 176, 0.7)'
                ],
                borderColor: [
                    'rgba(128, 135, 166, 1)',
                    'rgba(150, 184, 125, 1)',
                    'rgba(175, 141, 179, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
            },
            // Ensure the chart maintains aspect ratio
            maintainAspectRatio: false
        }
    });
}