import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

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
const auth = getAuth(app);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "auth.html";
  } else {
    await initFeed(user);
  }
});

async function initFeed(user) {
  const postInput = document.getElementById("post-input");
  const postBtn = document.getElementById("post-btn");
  const feed = document.getElementById("feed");
  const logoutBtn = document.getElementById("logout-btn");

  logoutBtn.addEventListener("click", () => signOut(auth));

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const userData = snap.exists() ? snap.data() : {};
  const displayName = userData.displayName || userData.username || "anonymous";

  postBtn.addEventListener("click", async () => {
    const text = postInput.value.trim();
    if (!text) return alert("Write something first!");

    await addDoc(collection(db, "posts"), {
      text,
      displayName,
      uid: user.uid,
      createdAt: serverTimestamp()
    });
    postInput.value = "";
    loadPosts();
  });

  async function loadPosts() {
    feed.innerHTML = "";
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((docSnap) => {
      const post = docSnap.data();
      const div = document.createElement("div");
      div.classList.add("post");
      div.innerHTML = `
        <b><a href="profile.html?uid=${post.uid}" class="user-link">${post.displayName}</a>:</b> ${post.text}
      `;
      feed.appendChild(div);
    });
  }

  loadPosts();
}
