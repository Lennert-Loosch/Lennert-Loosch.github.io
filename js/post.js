import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

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

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

onAuthStateChanged(auth, async (user) => {
  if (!user) window.location.href = "auth.html";
  else loadPost(user);
});

async function loadPost(user) {
  const postRef = doc(db, "posts", postId);
  const snap = await getDoc(postRef);
  if (!snap.exists()) return document.body.innerHTML = "<h2>Post not found.</h2>";

  const post = snap.data();
  const container = document.getElementById("post-container");

  let videoEmbed = "";
  if (post.videoUrl.includes("youtube.com/watch?v=")) {
    const videoId = post.videoUrl.split("v=")[1].split("&")[0];
    videoEmbed = `<iframe width="100%" height="250" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
  }

  container.innerHTML = `
    <h3>${post.title}</h3>
    ${post.description ? `<p>${post.description}</p>` : ""}
    ${videoEmbed}
    <p><a href="profile.html?username=${post.username}">@${post.username}</a></p>
  `;

  loadComments(user);
}

async function loadComments(user) {
  const q = query(collection(db, "comments"), where("postId", "==", postId));
  const snap = await getDocs(q);
  const comments = document.getElementById("comments");
  comments.innerHTML = "";
  snap.forEach((c) => {
    const d = c.data();
    const div = document.createElement("div");
    div.classList.add("comment");
    div.innerHTML = `<b>@${d.username}</b>: ${d.text}`;
    comments.appendChild(div);
  });

  const btn = document.getElementById("comment-btn");
  btn.onclick = async () => {
    const input = document.getElementById("comment-input");
    const text = input.value.trim();
    if (!text) return;
    await addDoc(collection(db, "comments"), {
      postId,
      uid: user.uid,
      username: user.displayName || user.email,
      text,
      createdAt: serverTimestamp()
    });
    input.value = "";
    loadComments(user);
  };
}
