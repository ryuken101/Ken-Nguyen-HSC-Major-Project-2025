import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

const auth = getAuth();

export function checkAuthState(protectedPage = false) {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            if (protectedPage && !user) {
                localStorage.setItem('redirect', window.location.pathname);
                window.location.href = 'login.html';
                return;
            }
            resolve(user);
        });
    });
}