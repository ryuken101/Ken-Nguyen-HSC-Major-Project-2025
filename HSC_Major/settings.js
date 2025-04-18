import { auth, db } from './firebase.js';
import { 
  updateEmail, 
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { 
  doc, 
  getDoc, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// Store original values for cancel functionality
const originalValues = {
  fName: '',
  lName: '',
  email: '',
  password: ''
};

// Initialize UI
function initUI() {
  // Hide all input fields, save and cancel buttons initially
  document.querySelectorAll('.edit-input').forEach(input => {
    input.style.display = 'none';
  });
  document.querySelectorAll('.save-btn, .cancel-btn').forEach(btn => {
    btn.style.display = 'none';
  });
}

// Load user data
async function loadUserData(user) {
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Store original values
      originalValues.fName = userData.fName || '';
      originalValues.lName = userData.lName || '';
      originalValues.email = user.email || '';
      
      // Display current values
      document.getElementById('fName-value').textContent = userData.fName || 'Not set';
      document.getElementById('lName-value').textContent = userData.lName || 'Not set';
      document.getElementById('email-value').textContent = user.email || 'Not set';
      
      // Set input values
      document.getElementById('fName-input').value = userData.fName || '';
      document.getElementById('lName-input').value = userData.lName || '';
      document.getElementById('email-input').value = user.email || '';
    } else {
      console.error("User document doesn't exist");
    }
  } catch (error) {
    console.error("Error loading user data:", error);
    alert("Error loading user data. Please try again later.");
  }
}

// Toggle edit mode
function toggleEditMode(field, isEditing) {
  const valueEl = document.getElementById(`${field}-value`);
  const inputEl = document.getElementById(`${field}-input`);
  const editBtn = document.getElementById(`${field}-edit-btn`);
  const saveBtn = document.getElementById(`${field}-save-btn`);
  const cancelBtn = document.getElementById(`${field}-cancel-btn`);

  if (isEditing) {
    // Switch to edit mode
    valueEl.style.display = 'none';
    inputEl.style.display = 'inline-block';
    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
    
    // For password, clear the input field when editing
    if (field === 'password') {
      document.getElementById('password-input').value = '';
    }
  } else {
    // Switch back to view mode
    valueEl.style.display = 'inline-block';
    inputEl.style.display = 'none';
    editBtn.style.display = 'inline-block';
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
    
    // Restore original value if canceling
    if (field !== 'password') {
      inputEl.value = originalValues[field];
    }
  }
}

// Cancel edit
function cancelEdit(field) {
  toggleEditMode(field, false);
}

// Save field data
async function saveField(field, newValue, needsAuth = false) {
  const user = auth.currentUser;
  if (!user) {
    alert("You need to be logged in to make changes.");
    return;
  }

  // Validate inputs
  if (!newValue && field !== 'password') {
    alert(`Please enter a valid ${field.replace('Name', ' name')}`);
    return;
  }

  if (field === 'email' && !/^\S+@\S+\.\S+$/.test(newValue)) {
    alert("Please enter a valid email address");
    return;
  }

  if (field === 'password' && newValue.length < 6) {
    alert("Password must be at least 6 characters long");
    return;
  }

  try {
    if (needsAuth) {
      const password = prompt("Please enter your current password to confirm changes:");
      if (!password) return; // User canceled
      
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
    }

    switch (field) {
      case 'fName':
      case 'lName':
        await updateDoc(doc(db, "users", user.uid), { 
          [field]: newValue 
        });
        document.getElementById(`${field}-value`).textContent = newValue;
        originalValues[field] = newValue; // Update original value
        break;
        
      case 'email':
        await updateEmail(user, newValue);
        await updateDoc(doc(db, "users", user.uid), { 
          email: newValue 
        });
        document.getElementById('email-value').textContent = newValue;
        originalValues.email = newValue; // Update original value
        break;
        
      case 'password':
        await updatePassword(user, newValue);
        document.getElementById('password-input').value = '';
        alert("Password updated successfully!");
        break;
    }

    toggleEditMode(field, false);
  } catch (error) {
    console.error(`Error updating ${field}:`, error);
    let errorMessage = error.message;
    
    // More user-friendly error messages
    if (error.code === 'auth/requires-recent-login') {
      errorMessage = "This operation is sensitive and requires recent authentication. Please log in again.";
    } else if (error.code === 'auth/email-already-in-use') {
      errorMessage = "This email is already in use by another account.";
    }
    
    alert(`Error updating ${field}: ${errorMessage}`);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Edit buttons
  document.getElementById('fName-edit-btn').addEventListener('click', () => toggleEditMode('fName', true));
  document.getElementById('lName-edit-btn').addEventListener('click', () => toggleEditMode('lName', true));
  document.getElementById('email-edit-btn').addEventListener('click', () => toggleEditMode('email', true));
  document.getElementById('password-edit-btn').addEventListener('click', () => toggleEditMode('password', true));
  
  // Save buttons
  document.getElementById('fName-save-btn').addEventListener('click', () => 
    saveField('fName', document.getElementById('fName-input').value.trim()));
  
  document.getElementById('lName-save-btn').addEventListener('click', () => 
    saveField('lName', document.getElementById('lName-input').value.trim()));
  
  document.getElementById('email-save-btn').addEventListener('click', () => 
    saveField('email', document.getElementById('email-input').value.trim(), true));
  
  document.getElementById('password-save-btn').addEventListener('click', () => 
    saveField('password', document.getElementById('password-input').value.trim(), true));
  
  // Cancel buttons
  document.getElementById('fName-cancel-btn').addEventListener('click', () => cancelEdit('fName'));
  document.getElementById('lName-cancel-btn').addEventListener('click', () => cancelEdit('lName'));
  document.getElementById('email-cancel-btn').addEventListener('click', () => cancelEdit('email'));
  document.getElementById('password-cancel-btn').addEventListener('click', () => cancelEdit('password'));
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
  initUI();
  
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await loadUserData(user);
      setupEventListeners();
    } else {
      window.location.href = 'login.html';
    }
  });
});