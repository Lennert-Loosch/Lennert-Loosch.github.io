import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, query, orderBy, serverTimestamp, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } 
  from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

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

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "auth.html";
  } else {
    initFeed(user);
  }
});

function initFeed(user) {
  const postInput = document.getElementById("post-input");
  const postBtn = document.getElementById("post-btn");
  const feed = document.getElementById("feed");
  const logoutBtn = document.getElementById("logout-btn");

  logoutBtn.addEventListener("click", () => signOut(auth));

  postBtn.addEventListener("click", async () => {
    const text = postInput.value.trim();
    if (!text) return alert("Write something first!");
    try {
      await addDoc(collection(db, "posts"), {
        text,
        user: user.email,
        createdAt: serverTimestamp(),
      });
      postInput.value = "";
    } catch (error) {
      console.error("Error adding post:", error);
    }
  });

  // 🔥 Real-time listener
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    feed.innerHTML = "";
    snapshot.forEach((doc) => {
      const post = doc.data();
      const div = document.createElement("div");
      div.classList.add("post");
      div.innerHTML = `<b>${post.user || "Unknown"}:</b> ${post.text}`;
      feed.appendChild(div);
    });
  });
}
