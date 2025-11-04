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
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
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
  if (!user) window.location.href = "auth.html";
  else initFeed(user);
});

async function initFeed(user) {
  const feed = document.getElementById("feed");
  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn.addEventListener("click", () => signOut(auth));

  // Composer controls
  const composer = document.getElementById("composer");
  const openBtn = document.getElementById("create-btn");
  const cancelBtn = document.getElementById("cancel-compose");
  const submitBtn = document.getElementById("submit-post");
  const titleInput = document.getElementById("post-title");
  const descInput = document.getElementById("post-description");
  const videoInput = document.getElementById("post-video");

  openBtn.addEventListener("click", () => composer.classList.add("show"));
  cancelBtn.addEventListener("click", () => composer.classList.remove("show"));

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const userData = snap.exists() ? snap.data() : {};

  submitBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const videoUrl = videoInput.value.trim();

    if (!title) return alert("A title is required.");
    if (videoUrl && !videoUrl.includes("youtube.com/watch?v=")) {
      return alert("Only YouTube links are allowed.");
    }

    await addDoc(collection(db, "posts"), {
      uid: user.uid,
      username: userData.username,
      displayName: userData.displayName,
      title,
      description,
      videoUrl: videoUrl || "",
      likes: [],
      favorites: [],
      reposts: [],
      createdAt: serverTimestamp()
    });

    composer.classList.remove("show");
    titleInput.value = descInput.value = videoInput.value = "";
    loadFeed();
  });

  async function toggleField(postId, field) {
    const ref = doc(db, "posts", postId);
    const snap = await getDoc(ref);
    const data = snap.data();
    const has = data[field]?.includes(user.uid);
    await updateDoc(ref, {
      [field]: has ? arrayRemove(user.uid) : arrayUnion(user.uid)
    });
    loadFeed();
  }

  async function loadFeed() {
    feed.innerHTML = "<p>Loading posts...</p>";
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      feed.innerHTML = "";

      if (snap.empty) {
        feed.innerHTML = "<p>No posts yet. Be the first to create one!</p>";
        return;
      }

      snap.forEach((docSnap) => {
        const post = docSnap.data();
        const postId = docSnap.id;
        const div = document.createElement("div");
        div.classList.add("post");

        const hasLiked = post.likes?.includes(user.uid);
        const hasFav = post.favorites?.includes(user.uid);
        const hasRepost = post.reposts?.includes(user.uid);

        let videoEmbed = "";
        if (post.videoUrl && post.videoUrl.includes("youtube.com/watch?v=")) {
          const id = post.videoUrl.split("v=")[1].split("&")[0];
          videoEmbed = `<iframe src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`;
        }

        div.innerHTML = `
          <h3>${post.title}</h3>
          ${post.description ? `<p>${post.description}</p>` : ""}
          ${videoEmbed}
          <div class="meta">
            <a href="profile.html?username=${post.username}">@${post.username}</a> • 
            <a href="post.html?id=${postId}" class="view-link">View</a>
          </div>
          <div class="actions">
            <button class="like-btn" data-id="${postId}">${hasLiked ? "❤️" : "🤍"} ${post.likes?.length || 0}</button>
            <button class="repost-btn" data-id="${postId}">${hasRepost ? "🔁" : "↪️"} ${post.reposts?.length || 0}</button>
            <button class="fav-btn" data-id="${postId}">${hasFav ? "⭐" : "☆"} ${post.favorites?.length || 0}</button>
          </div>
        `;
        feed.appendChild(div);
      });

      document.querySelectorAll(".like-btn").forEach(btn =>
        btn.onclick = () => toggleField(btn.dataset.id, "likes")
      );
      document.querySelectorAll(".repost-btn").forEach(btn =>
        btn.onclick = () => toggleField(btn.dataset.id, "reposts")
      );
      document.querySelectorAll(".fav-btn").forEach(btn =>
        btn.onclick = () => toggleField(btn.dataset.id, "favorites")
      );
    } catch (err) {
      console.error("Feed load error:", err);
      feed.innerHTML = "<p>Error loading feed.</p>";
    }
  }

  loadFeed();
}
