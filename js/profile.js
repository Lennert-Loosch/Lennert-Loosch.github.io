import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy
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
const db = getFirestore(app);

const params = new URLSearchParams(window.location.search);
const uid = params.get("uid");

if (!uid) {
  document.body.innerHTML = "<h2 style='text-align:center'>Profile not found</h2>";
} else {
  loadProfile(uid);
}

async function loadProfile(uid) {
  const profileRef = doc(db, "users", uid);
  const snap = await getDoc(profileRef);
  const nameEl = document.getElementById("profile-name");
  const bioEl = document.getElementById("profile-bio");
  const postsEl = document.getElementById("profile-posts");

  if (snap.exists()) {
    const data = snap.data();
    nameEl.textContent = data.displayName || data.username;
    bioEl.textContent = data.bio || "No bio yet.";
  } else {
    nameEl.textContent = "Unknown user";
    bioEl.textContent = "";
  }

  const postsQ = query(collection(db, "posts"), where("uid", "==", uid), orderBy("createdAt", "desc"));
  const postsSnap = await getDocs(postsQ);
  postsEl.innerHTML = "";
  postsSnap.forEach((p) => {
    const d = p.data();
    const div = document.createElement("div");
    div.classList.add("post");
    div.innerHTML = `<b>${d.displayName}:</b> ${d.text}`;
    postsEl.appendChild(div);
  });
}
