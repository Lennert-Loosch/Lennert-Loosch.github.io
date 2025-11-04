import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs
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

// Generate a random username until it's unique
async function generateUniqueUsername() {
  const animals = ["fox", "wolf", "cat", "hawk", "owl", "lion", "bear", "shark", "tiger"];
  const adjectives = ["fast", "brave", "happy", "silly", "clever", "calm", "lucky", "cool"];
  let username;
  let exists = true;

  while (exists) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const ani = animals[Math.floor(Math.random() * animals.length)];
    const num = Math.floor(Math.random() * 1000);
    username = `${adj}_${ani}${num}`;

    const q = query(collection(db, "users"), where("username", "==", username));
    const snap = await getDocs(q);
    exists = !snap.empty;
  }
  return username;
}

async function ensureUserProfile(user) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) return;

  const username = await generateUniqueUsername();

  await setDoc(userRef, {
    email: user.email,
    username,
    displayName: username,
    bio: "",
    createdAt: new Date()
  });
}

async function handleAuth(promise) {
  const cred = await promise;
  await ensureUserProfile(cred.user);
  window.location.href = "feed.html";
}

document.getElementById("signup-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await handleAuth(createUserWithEmailAndPassword(auth, email.value, password.value));
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById("login-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await handleAuth(signInWithEmailAndPassword(auth, email.value, password.value));
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById("google-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await handleAuth(signInWithPopup(auth, provider));
  } catch (err) {
    alert(err.message);
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user && !window.location.href.includes("feed.html")) {
    await ensureUserProfile(user);
    window.location.href = "feed.html";
  }
});
