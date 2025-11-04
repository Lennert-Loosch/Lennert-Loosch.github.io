import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut 
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

// DOM elements
const emailEl = document.getElementById("user-email");
const displayNameInput = document.getElementById("displayName");
const bioInput = document.getElementById("bio");
const saveBtn = document.getElementById("save-btn");
const statusEl = document.getElementById("status");
const logoutBtn = document.getElementById("logout-btn");

// Watch for auth state
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "auth.html";
  } else {
    emailEl.textContent = user.email;
    await loadProfile(user.uid);
  }
});

logoutBtn.addEventListener("click", () => signOut(auth));

async function loadProfile(uid) {
  try {
    const docRef = doc(db, "users", uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      displayNameInput.value = data.displayName || "";
      bioInput.value = data.bio || "";
    }
  } catch (err) {
    console.error("Error loading profile:", err);
  }
}

saveBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const displayName = displayNameInput.value.trim();
  const bio = bioInput.value.trim();

  try {
    await setDoc(
      doc(db, "users", user.uid),
      { displayName, bio, updatedAt: new Date() },
      { merge: true }
    );
    statusEl.textContent = "Profile updated successfully!";
    setTimeout(() => (statusEl.textContent = ""), 3000);
  } catch (err) {
    console.error("Error saving profile:", err);
    statusEl.textContent = "Failed to save changes.";
  }
});
