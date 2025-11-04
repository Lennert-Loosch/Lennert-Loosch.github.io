import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBFfuOaMQtzqg9OMCHLRaYWJuNKzQZSJes",
  authDomain: "tweetin-3a780.firebaseapp.com",
  projectId: "tweetin-3a780",
  storageBucket: "tweetin-3a780.appspot.com",
  messagingSenderId: "178795608225",
  appId: "1:178795608225:web:4142f4d80c9b25578118e0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const email = document.getElementById("email");
const password = document.getElementById("password");

document.getElementById("signup-btn").addEventListener("click", async () => {
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    window.location.href = "feed.html";
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById("login-btn").addEventListener("click", async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    window.location.href = "feed.html";
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById("google-btn").addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
    window.location.href = "feed.html";
  } catch (error) {
    alert(error.message);
  }
});

// Auto-redirect if already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "feed.html";
  }
});
