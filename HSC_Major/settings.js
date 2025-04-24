import { getAuth, onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

document.addEventListener('DOMContentLoaded', function() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            initializePage(user);
        } else {
            window.location.href = 'login.html?redirect=settings';
        }
    });
});

function initializePage(user) {
    loadUserData(user.uid);
    
    document.getElementById('edit-all-btn').addEventListener('click', enableEditing);
    document.getElementById('save-all-btn').addEventListener('click', () => saveChanges(user));
    document.getElementById('cancel-all-btn').addEventListener('click', cancelEditing);
    
    // Password change modal setup
    document.getElementById('change-password-btn')?.addEventListener('click', showPasswordModal);
    document.getElementById('save-password-btn')?.addEventListener('click', changePassword);
    document.getElementById('close-password-modal')?.addEventListener('click', hidePasswordModal);
}

async function loadUserData(uid) {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Update display values
            document.getElementById('fName-value').textContent = userData.fName || '';
            document.getElementById('lName-value').textContent = userData.lName || '';
            document.getElementById('email-value').textContent = userData.email || '';
            
            // Set input values
            document.getElementById('fName-input').value = userData.fName || '';
            document.getElementById('lName-input').value = userData.lName || '';
            document.getElementById('email-input').value = userData.email || '';
        }
    } catch (error) {
        console.error("Error loading data:", error);
        alert("Error loading your data. Please try again.");
    }
}

function enableEditing() {
    // Show all input fields except password
    document.querySelectorAll('.field-value').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.edit-input:not(#password-input)').forEach(input => {
        input.style.display = 'block';
        input.disabled = false;
    });
    
    // Toggle buttons
    document.getElementById('edit-all-btn').style.display = 'none';
    document.getElementById('save-all-btn').style.display = 'inline-block';
    document.getElementById('cancel-all-btn').style.display = 'inline-block';
    document.getElementById('change-password-btn').style.display = 'inline-block';
}

function cancelEditing() {
    // Reset to view mode
    document.querySelectorAll('.field-value').forEach(el => el.style.display = 'inline');
    document.querySelectorAll('.edit-input').forEach(input => {
        input.style.display = 'none';
        input.disabled = true;
    });
    
    document.getElementById('edit-all-btn').style.display = 'inline-block';
    document.getElementById('save-all-btn').style.display = 'none';
    document.getElementById('cancel-all-btn').style.display = 'none';
    document.getElementById('change-password-btn').style.display = 'none';
    
    loadUserData(auth.currentUser.uid);
}

async function saveChanges(user) {
    const newData = {
        fName: document.getElementById('fName-input').value.trim(),
        lName: document.getElementById('lName-input').value.trim(),
        email: document.getElementById('email-input').value.trim()
    };

    try {
        await updateDoc(doc(db, "users", user.uid), newData);
        
        // Update displayed values
        document.getElementById('fName-value').textContent = newData.fName;
        document.getElementById('lName-value').textContent = newData.lName;
        document.getElementById('email-value').textContent = newData.email;
        
        cancelEditing();
        alert("Profile updated successfully!");
    } catch (error) {
        console.error("Error saving changes:", error);
        alert("Error saving changes: " + error.message);
    }
}

// Password Change Functions
function showPasswordModal() {
    document.getElementById('password-modal').style.display = 'flex';
    document.getElementById('current-password').focus();
}

function hidePasswordModal() {
    document.getElementById('password-modal').style.display = 'none';
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('password-error').textContent = '';
}

async function changePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorElement = document.getElementById('password-error');
    
    // Clear previous errors
    errorElement.textContent = '';
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        errorElement.textContent = 'Please fill in all fields';
        return;
    }
    
    if (newPassword !== confirmPassword) {
        errorElement.textContent = 'New passwords do not match';
        return;
    }
    
    if (newPassword.length < 6) {
        errorElement.textContent = 'Password must be at least 6 characters';
        return;
    }

    const user = auth.currentUser;
    const email = user.email;
    
    try {
        // Create credential with current email and password
        const credential = EmailAuthProvider.credential(email, currentPassword);
        
        // Reauthenticate user
        await reauthenticateWithCredential(user, credential);
        
        // Update password in Firebase Authentication
        await updatePassword(user, newPassword);
        
        console.log("Password updated in Firebase Auth successfully");
        
        // Update Firestore with timestamp (optional)
        try {
            await updateDoc(doc(db, "users", user.uid), {
                passwordLastChanged: new Date().toISOString()
            });
            console.log("Password change timestamp updated in Firestore");
        } catch (firestoreError) {
            console.error("Error updating Firestore timestamp:", firestoreError);
            // This isn't critical, so we continue
        }
        
        alert("Password changed successfully!");
        hidePasswordModal();
        
        // Optional: Force logout and redirect to login page
        setTimeout(() => {
            auth.signOut().then(() => {
                window.location.href = 'login.html';
            });
        }, 2000);
        
    } catch (error) {
        console.error("Password change error:", error);
        
        switch(error.code) {
            case 'auth/wrong-password':
                errorElement.textContent = 'Current password is incorrect';
                break;
            case 'auth/weak-password':
                errorElement.textContent = 'Password is too weak (min 6 characters)';
                break;
            case 'auth/requires-recent-login':
                errorElement.textContent = 'Session expired. Please log in again.';
                // Redirect to login page
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                break;
            default:
                errorElement.textContent = 'Error changing password: ' + error.message;
        }
    }
}