import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUU2wXBEWT8c-6pOS2iyEjvgQlGzmolRo",
  authDomain: "purrsue-login.firebaseapp.com",
  projectId: "purrsue-login",
  storageBucket: "purrsue-login.appspot.com",
  messagingSenderId: "329901830629",
  appId: "1:329901830629:web:ba907e54131d88ea21bf0c"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', async () => {
    const leaderboardList = document.getElementById('leaderboard-list');
    
    async function fetchLeaderboardData() {
        try {
            // Get all users
            const usersRef = collection(db, "users");
            const usersSnapshot = await getDocs(usersRef);
            
            const leaderboardData = [];
            
            // Process each user
            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();
                
                // Get stats from the user document directly
                if (userData.level && userData.XP) {
                    leaderboardData.push({
                        id: userDoc.id,
                        fName: userData.fName || 'Anonymous',
                        level: userData.level || 1,
                        xp: userData.XP || 0
                    });
                }
                // If stats are in a subcollection:
                else {
                    try {
                        const statsRef = doc(db, "users", userDoc.id, "data", "stats");
                        const statsSnap = await getDoc(statsRef);
                        
                        if (statsSnap.exists()) {
                            leaderboardData.push({
                                id: userDoc.id,
                                fName: userData.fName || 'Anonymous',
                                level: statsSnap.data().level || 1,
                                xp: statsSnap.data().XP || 0
                            });
                        }
                    } catch (error) {
                        console.log(`No stats found for user ${userDoc.id}`);
                    }
                }
            }
            
            // Sort by level (desc) then XP (desc)
            return leaderboardData.sort((a, b) => {
                if (b.level === a.level) return b.xp - a.xp;
                return b.level - a.level;
            });
            
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            return [];
        }
    }

    function renderLeaderboard(users) {
        leaderboardList.innerHTML = '';
        
        if (users.length === 0) {
            leaderboardList.innerHTML = '<div class="no-users">No users with stats found</div>';
            return;
        }
        
        users.forEach((user, index) => {
            const leaderboardItem = document.createElement('div');
            leaderboardItem.className = 'leaderboard-item';
            leaderboardItem.innerHTML = `
                <span class="rank">${index + 1}</span>
                <span class="name">${user.fName}</span>
                <span class="level">Level ${user.level}</span>
                <span class="xp">${user.xp} XP</span>
            `;
            leaderboardList.appendChild(leaderboardItem);
        });
    }

    // Initial load
    const leaderboardData = await fetchLeaderboardData();
    renderLeaderboard(leaderboardData);
});