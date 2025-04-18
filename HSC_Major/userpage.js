// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";


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

// Check if the user is logged in
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is signed in
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const userName = `${userData.fName} ${userData.lName}`;

      // Display the user's name
      const userNameElement = document.getElementById('user_name');
      if (userNameElement) {
        userNameElement.textContent = userName;
      }
    } else {
      console.error("User data not found in Firestore.");
    }
  } else {
    // User is not signed in, redirect to login page
    window.location.href = 'login.html';
  }
});

// Dashboard 
const allSideMenu = document.querySelectorAll('#sidebar .side_menu.top li a');

allSideMenu.forEach(item => {
    const li = item.parentElement;

    item.addEventListener('click', function () {
        allSideMenu.forEach(i => {
            i.parentElement.classList.remove('active'); 
        });
        li.classList.add('active'); 
    });
});

// Toggle sidebar 

const menubar = document.querySelector('#content nav .material-symbols--menu-rounded');
const sidebar = document.getElementById('sidebar');

menubar.addEventListener('click', function () {
  sidebar.classList.toggle('hide');
})

if(window.innerWidth < 768) {
  sidebar.classList.add('hide');

}

const search_btn = document.querySelector('#content nav form .form_input button');
const search_form = document.querySelector('#content nav form');

  search_btn.addEventListener('click', function (e) {
    if(window.innerWidth < 576) {
      e.preventDefault();
      search_form.classList.toggle('show');
    }
  })



