import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  deleteUser
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc
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

const emailEl = document.getElementById("user-email");
const displayNameInput = document.getElementById("displayName");
const bioInput = document.getElementById("bio");
const saveBtn = document.getElementById("save-btn");
const statusEl = document.getElementById("status");
const logoutBtn = document.getElementById("logout-btn");
const deleteBtn = document.getElementById("delete-btn");
const postsContainer = document.getElementById("user-posts");

onAuthStateChanged(auth, async (user) => {
  if (!user) return (window.location.href = "auth.html");
  emailEl.textContent = user.email;
  await loadProfile(user.uid);
  await loadUserPosts(user.uid);
});

logoutBtn.addEventListener("click", () => signOut(auth));

saveBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await setDoc(
      doc(db, "users", user.uid),
      { displayName: displayNameInput.value.trim(), bio: bioInput.value.trim(), updatedAt: new Date() },
      { merge: true }
    );
    statusEl.textContent = "Profile updated successfully!";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Failed to save profile.";
  }
});

deleteBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;
  const confirmDelete = confirm("Are you sure you want to permanently delete your account?");
  if (!confirmDelete) return;

  try {
    // delete user's posts
    const q = query(collection(db, "posts"), where("uid", "==", user.uid));
    const qs = await getDocs(q);
    for (const d of qs.docs) await deleteDoc(d.ref);

    // delete profile doc
    await deleteDoc(doc(db, "users", user.uid));
    await deleteUser(user);
    alert("Account deleted.");
    window.location.href = "auth.html";
  } catch (err) {
    console.error(err);
    alert("Error deleting account: " + err.message);
  }
});

async function loadProfile(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();
    displayNameInput.value = data.displayName || data.username || "";
    bioInput.value = data.bio || "";
  }
}

async function loadUserPosts(uid) {
  postsContainer.innerHTML = "<h3>Your Posts</h3>";
  const q = query(collection(db, "posts"), where("uid", "==", uid));
  const qs = await getDocs(q);
  if (qs.empty) {
    postsContainer.innerHTML += "<p>No posts yet.</p>";
  } else {
    qs.forEach((d) => {
      const p = d.data();
      const div = document.createElement("div");
      div.classList.add("post");
      div.innerHTML = `<b>${p.displayName}</b><br>${p.text}`;
      postsContainer.appendChild(div);
    });
  }
}
