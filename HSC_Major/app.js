// Home Navbar
const menu = document.querySelector('#mobile-menu')
const menuLink = document.querySelector('.navbar_menu')

menu.addEventListener('click', function() {
    menu.classList.toggle('is-active');
    menuLink.classList.toggle('active');
})

// Login/Signup
const signUpButton=document.getElementById('signup_button');
const logInButton=document.getElementById('login_button');
const logInForm=document.getElementById('login');
const signUpForm=document.getElementById('signup');

signUpButton.addEventListener('click',function(){
    logInForm.style.display="none";
    signUpForm.style.display="block";
})
logInButton.addEventListener('click', function(){
    logInForm.style.display="block";
    signUpForm.style.display="none";
})

// Firbase setup

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUU2wXBEWT8c-6pOS2iyEjvgQlGzmolRo",
  authDomain: "purrsue-login.firebaseapp.com",
  projectId: "purrsue-login",
  storageBucket: "purrsue-login.firebasestorage.app",
  messagingSenderId: "329901830629",
  appId: "1:329901830629:web:ba907e54131d88ea21bf0c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);



