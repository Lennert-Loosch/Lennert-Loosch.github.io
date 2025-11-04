import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  deleteUser
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const email = document.getElementById("email");
const password = document.getElementById("password");

async function createUserProfile(user) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) return;

  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const username = `user_${randomSuffix}`;

  await setDoc(userRef, {
    email: user.email,
    username,
    displayName: username,
    bio: "",
    createdAt: new Date()
  });
}

async function authAndRedirect(promise) {
  const cred = await promise;
  await createUserProfile(cred.user);
  window.location.href = "feed.html";
}

document.getElementById("signup-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await authAndRedirect(createUserWithEmailAndPassword(auth, email.value, password.value));
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById("login-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await authAndRedirect(signInWithEmailAndPassword(auth, email.value, password.value));
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById("google-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await authAndRedirect(signInWithPopup(auth, provider));
  } catch (err) {
    alert(err.message);
  }
});

// Auto-redirect if logged in
onAuthStateChanged(auth, (user) => {
  if (user && !window.location.href.includes("feed.html")) {
    window.location.href = "feed.html";
  }
});
