// Import the functions from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// Your web app's Firebase configuration
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

// Home Navbar
const menu = document.querySelector('#mobile-menu');
const menuLink = document.querySelector('.navbar_menu');



menu.addEventListener('click', function() {
    menu.classList.toggle('is-active');
    menuLink.classList.toggle('active');
});



// Login/Signup
const signUpButton = document.getElementById('signup_button');
const logInButton = document.getElementById('login_button');
const logInForm = document.getElementById('login');
const signUpForm = document.getElementById('signup');

if (signUpButton && logInButton) {
    signUpButton.addEventListener('click', function() {
        logInForm.style.display = "none";
        signUpForm.style.display = "block";
    });
    logInButton.addEventListener('click', function() {
        logInForm.style.display = "block";
        signUpForm.style.display = "none";
    });
}

// Authentication Message 
function showMessage(message, divId) {
    var messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(function() {
        messageDiv.style.opacity = 0;
    }, 5000);
}

// Submit Button
const submit = document.getElementById('submit_btn');
if (submit) {
    submit.addEventListener("click", (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const fName = document.getElementById('fName').value;
        const lName = document.getElementById('lName').value;

        // Passes account details
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                const userData = {
                    email: email,
                    fName: fName,
                    lName: lName,
                    password: password,
                    createdAt: new Date()
                };
                showMessage('Account Created Successfully', 'signup_message');
                const docRef = doc(db, "users", user.uid);
                setDoc(docRef, userData)
                    .then(() => {
                        window.location.href = 'login.html';
                    })
                    .catch((error) => {
                        console.error("Error writing document", error);
                    });
            })
            // Checks if account already exists
            .catch((error) => {
                const errorCode = error.code;
                if (errorCode == 'auth/email-already-in-use') {
                    showMessage('Email Address Already Exists!', 'signup_message');
                } else {
                    showMessage('Unable to create User: ' + error.message, 'signup_message');
                }
            });
    });
}

        

// Login Functionality
const loginSubmitBtn = document.getElementById('login_submit_btn');
if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener("click", async (event) => {
        event.preventDefault();

        // Get form values
        const email = document.getElementById('login_email').value;
        const password = document.getElementById('login_password').value;

        try {
            // Sign in the user
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store the user's UID in localStorage
            localStorage.setItem('loggedInUserId', user.uid);

            // Show success message and redirect
            showMessage('Login successful! Redirecting...', 'login_message');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000); // Redirect after 2 seconds
        } catch (error) {
            console.error("Error during login:", error);

            // Handle specific errors
            if (error.code === 'auth/invalid-credential') {
                showMessage('Incorrect email or password.', 'login_message');
            } else if (error.code === 'auth/user-not-found') {
                showMessage('User not found. Please sign up.', 'login_message');
            } else {
                showMessage('Unable to log in. Please try again.', 'login_message');
            }
        }
    });
}

// Logout functionality
const logoutBtn = document.querySelector('#logout');

if(logoutBtn) {
    logoutBtn.addEventListener('click', async (e) =>{
        e.preventDefault();
        
        signOut(auth).then(() => {
            alert('See you soon!')
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000); // Redirect after 2 seconds

        }).catch((error) => {
            alert('An error occurred when logging out')
        })
    })
}








