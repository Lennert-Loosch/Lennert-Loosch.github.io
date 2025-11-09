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
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

// Firebase config
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
const storage = getStorage(app);

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
  const imageInput = document.getElementById("post-image");

  openBtn.addEventListener("click", () => composer.classList.add("show"));
  cancelBtn.addEventListener("click", () => composer.classList.remove("show"));
  window.addEventListener("click", (e) => {
    if (e.target === composer) composer.classList.remove("show");
  });

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const userData = snap.exists() ? snap.data() : {};

  // Post creation
  submitBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const imageFile = imageInput.files[0];

    if (!title) return alert("A title is required.");
    
    // Validate image size (2MB max)
    if (imageFile && imageFile.size > 2 * 1024 * 1024) {
      return alert("Image must be less than 2MB.");
    }

    let imageUrl = "";
    
    // Upload image if provided
    if (imageFile) {
      try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Uploading...";
        
        const imageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      } catch (error) {
        console.error("Image upload error:", error);
        alert("Failed to upload image. Please try again.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Post";
        return;
      }
    }

    await addDoc(collection(db, "posts"), {
      uid: user.uid,
      username: userData.username,
      displayName: userData.displayName,
      title,
      description,
      imageUrl: imageUrl || "",
      likes: [],
      favorites: [],
      reposts: [],
      createdAt: serverTimestamp()
    });

    composer.classList.remove("show");
    titleInput.value = descInput.value = "";
    imageInput.value = "";
    submitBtn.disabled = false;
    submitBtn.textContent = "Post";
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

        const imageHtml = post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" loading="lazy">` : "";

        div.innerHTML = `
          <h3>${post.title}</h3>
          ${post.description ? `<p>${post.description}</p>` : ""}
          ${imageHtml}
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
