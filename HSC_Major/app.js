// Import the functions from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail  } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { getDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { 
    setPersistence, 
    browserSessionPersistence,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";


// Firebase configuration
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


setPersistence(auth, browserSessionPersistence)
  .then(() => console.log("Auth persistence enabled"))
  .catch((err) => console.error("Auth persistence error:", err));

// Home Navbar
const menu = document.querySelector('#mobile-menu');
const menuLink = document.querySelector('.navbar_menu');



menu.addEventListener('click', function() {
    menu.classList.toggle('is-active');
    menuLink.classList.toggle('active');
});

    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });



// Login/Signup
const signUpButton = document.getElementById('signup_button');
const logInButton = document.getElementById('login_button');
const logInForm = document.getElementById('login');
const signUpForm = document.getElementById('signup');

const petLogged = document.getElementById('petLogged');
const petHappy = 'Animation/kitten-happy.gif';

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

// Sigup Functionality
const submit = document.getElementById('submit_btn');
if (submit) {
    submit.addEventListener("click", (event) => {
        event.preventDefault();
        
        // Sanitize all inputs
        const email = sanitizeInput(document.getElementById('email').value.trim());
        const password = document.getElementById('password').value; // Don't sanitize password
        const fName = sanitizeInput(document.getElementById('fName').value.trim());
        const lName = sanitizeInput(document.getElementById('lName').value.trim());

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showMessage('Please enter a valid email address', 'signup_message');
            return;
        }

        // Validate password strength
        if (password.length < 8) {
            showMessage('Password must be at least 8 characters long', 'signup_message');
            return;
        }

        // Validate password match
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'signup_message');
            return;
        }

        // Validate name fields
        if (!fName || !lName) {
            showMessage('First and last name are required', 'signup_message');
            return;
        }

        // Passes account details
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                const userData = {
                    email: email,
                    fName: fName,
                    lName: lName,
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

const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

if (passwordInput && confirmPasswordInput) {
    [passwordInput, confirmPasswordInput].forEach(input => {
        input.addEventListener('input', () => {
            if (passwordInput.value && confirmPasswordInput.value) {
                if (passwordInput.value !== confirmPasswordInput.value) {
                    confirmPasswordInput.classList.add('password-mismatch');
                    confirmPasswordInput.classList.remove('password-match');
                } else {
                    confirmPasswordInput.classList.add('password-match');
                    confirmPasswordInput.classList.remove('password-mismatch');
                }
            } else {
                confirmPasswordInput.classList.remove('password-mismatch', 'password-match');
            }
        });
    });
}

        

// Login Functionality
const loginSubmitBtn = document.getElementById('login_submit_btn');
if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        // Sanitize inputs
        const email = sanitizeInput(document.getElementById('login_email').value.trim());
        const password = document.getElementById('login_password').value; // Don't sanitize password

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showMessage('Please enter a valid email address', 'login_message');
            return;
        }

        // Validate password presence
        if (!password) {
            showMessage('Please enter your password', 'login_message');
            return;
        }

        if (!checkRateLimit(email)) {
            return;
        }

        try {
            // Set persistence before signing in
            await setPersistence(auth, browserSessionPersistence);
            
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Store basic user data
            localStorage.setItem('user', JSON.stringify({
                uid: user.uid,
                email: user.email
            }));

            // Update user document if needed
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    fName: '',
                    lName: '',
                    createdAt: new Date()
                });
            }

            showMessage('Login successful!', 'login_message');
            petLogged.src = petHappy;
            setTimeout(() => {
                // Check for redirect parameter or go to dashboard
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect') || 'dashboard.html';
                window.location.href = redirect;
            }, 1500);
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


// Password Reset 
if (window.location.pathname.includes('reset-password.html')) {
    document.getElementById('reset-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = sanitizeInput(document.getElementById('reset_email').value.trim());

        // Validate email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showMessage('Please enter a valid email address', 'reset_message');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            showMessage('If an account exists with this email, a reset link has been sent.', 'reset_message');
        } catch (error) {
            // Generic message to avoid email enumeration
            showMessage('If an account exists with this email, a reset link has been sent.', 'reset_message');
            console.error("Password reset error:", error);
        }
    });
}

const loginAttempts = {};
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(email) {
    const now = Date.now();
    if (!loginAttempts[email]) {
        loginAttempts[email] = { count: 1, timestamp: now };
        return true;
    }
    
    // Reset if window has passed
    if (now - loginAttempts[email].timestamp > ATTEMPT_WINDOW) {
        loginAttempts[email] = { count: 1, timestamp: now };
        return true;
    }
    
    // Increment count
    loginAttempts[email].count++;
    
    if (loginAttempts[email].count > MAX_ATTEMPTS) {
        const timeLeft = Math.ceil((ATTEMPT_WINDOW - (now - loginAttempts[email].timestamp)) / 60000);
        alert(`Too many attempts. Please try again in ${timeLeft} minutes.`);
        return false;
    }
    
    return true;
}


// Input sanitization function
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    // Remove HTML tags to prevent XSS
    input = input.replace(/<[^>]*>?/gm, '');
    
    // Escape special characters that could lead to injection
    const escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };
    
    return input.replace(/[&<>"'/]/g, (match) => escapeMap[match]);
}

// Video Replay

const demoVid = document.querySelector('video');

demoVid.addEventListener('ended', () => {
    demoVid.currentTime = 0;
    demoVid.play();
})
