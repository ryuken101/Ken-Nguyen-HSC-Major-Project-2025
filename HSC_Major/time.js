
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();




function updateClock() {
    const now = new Date();
    
    // Update time display
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 to 12
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('seconds').textContent = now.getSeconds().toString().padStart(2, '0');
    document.getElementById('ampm').textContent = ampm;
    
    // Update date display
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    document.getElementById('dayname').textContent = days[now.getDay()];
    document.getElementById('month').textContent = months[now.getMonth()];
    document.getElementById('daynum').textContent = now.getDate();
    document.getElementById('year').textContent = now.getFullYear();

    setTimeout(updateClock, 1000);
}

// Sleep time functions
async function getSleepTimes(userId) {
    try {
        const docRef = doc(db, "users", userId, "data", "sleep-schedule");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().petSleepSchedule) {
            return docSnap.data().petSleepSchedule;
        }
        return { bedtime: "22:00", wakeup: "07:00" }; // Default values
    } catch (error) {
        console.error("Error getting sleep times:", error);
        return { bedtime: "22:00", wakeup: "07:00" };
    }
}

async function saveSleepTimes(userId, bedtime, wakeup) {
    try {
        await setDoc(doc(db, "users", userId, "data", "sleep-schedule"), {
            petSleepSchedule: { bedtime, wakeup }
        }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error saving sleep times:", error);
        return false;
    }
}

function isSleepTime(now, bedtime, wakeup) {
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeup.split(':').map(Number);
    
    const bedTime = new Date();
    bedTime.setHours(bedHour, bedMin, 0, 0);
    
    const wakeTime = new Date();
    wakeTime.setHours(wakeHour, wakeMin, 0, 0);
    
    if (bedTime > wakeTime) {
        return now >= bedTime || now < wakeTime;
    }
    return now >= bedTime && now < wakeTime;
}

async function updatePetState() {
    const now = new Date();
    const user = auth.currentUser;
    
    if (user) {
        try {
            const { bedtime, wakeup } = await getSleepTimes(user.uid);
            const petImg = document.querySelector('.pet-container img');
            
            if (petImg) {
                petImg.src = isSleepTime(now, bedtime, wakeup) 
                    ? "Animation/kitten-sleeping.gif" 
                    : "Animation/kitten-idle.gif";
            }
        } catch (error) {
            console.error("Error updating pet state:", error);
        }
    }
}

// Initialize everything when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Load saved sleep times
            const { bedtime, wakeup } = await getSleepTimes(user.uid);
            document.getElementById('bedtime-input').value = bedtime;
            document.getElementById('wakeup-input').value = wakeup;
            
            // Set up save button
            const saveBtn = document.getElementById('save-sleep-times');
            if (saveBtn) {
                saveBtn.addEventListener('click', async () => {
                    const bedtime = document.getElementById('bedtime-input').value;
                    const wakeup = document.getElementById('wakeup-input').value;
                    
                    if (bedtime && wakeup) {
                        const saved = await saveSleepTimes(user.uid, bedtime, wakeup);
                        if (saved) {
                            updatePetState();
                            alert('Sleep schedule saved!');
                        }
                    } else {
                        alert('Please enter both times');
                    }
                });
            }
            
            updatePetState();
        }
    });
});