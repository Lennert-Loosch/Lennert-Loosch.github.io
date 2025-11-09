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
  orderBy,
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
const db = getFirestore(app);
const auth = getAuth(app);

const params = new URLSearchParams(window.location.search);
const viewedUsername = params.get("username");

const nameEl = document.getElementById("profile-name");
const bioEl = document.getElementById("profile-bio");
const postsEl = document.getElementById("profile-posts");
const editTools = document.getElementById("edit-tools");
const displayNameInput = document.getElementById("displayName");
const bioInput = document.getElementById("bio");
const saveBtn = document.getElementById("save-btn");
const deleteAccountBtn = document.getElementById("delete-account-btn");
const statusEl = document.getElementById("status");
const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "auth.html";
    return;
  }

  const myUserDoc = await getDoc(doc(db, "users", user.uid));
  const myData = myUserDoc.exists() ? myUserDoc.data() : {};
  const myUsername = myData.username;

  const targetUsername = viewedUsername || myUsername;
  await loadProfile(targetUsername, user.uid, myUsername);
});

async function loadProfile(username, currentUid, myUsername) {
  try {
    const usersQ = query(collection(db, "users"), where("username", "==", username));
    const usersSnap = await getDocs(usersQ);

    if (usersSnap.empty) {
      nameEl.textContent = `@${username}`;
      bioEl.textContent = "This user doesn't exist.";
      return;
    }

    const userDoc = usersSnap.docs[0];
    const data = userDoc.data();
    const profileUid = userDoc.id;

    nameEl.textContent = `${data.displayName || data.username} (@${data.username})`;
    bioEl.textContent = data.bio || "No bio yet.";

    const isOwner = data.username === myUsername;
    if (isOwner) {
      editTools.style.display = "flex";
      displayNameInput.value = data.displayName || "";
      bioInput.value = data.bio || "";
      saveBtn.onclick = () => saveProfile(profileUid);
      deleteAccountBtn.onclick = () => deleteAccount(profileUid, currentUid);
    }

    await loadPosts(username, isOwner, currentUid);
  } catch (error) {
    console.error("Error loading profile:", error);
    postsEl.innerHTML = "<p>Error loading profile data.</p>";
  }
}

async function loadPosts(username, isOwner, currentUid) {
  postsEl.innerHTML = "<h3>Posts</h3>";

  try {
    // main query (with orderBy)
    const postsQ = query(
      collection(db, "posts"),
      where("username", "==", username),
      orderBy("createdAt", "desc")
    );
    const postsSnap = await getDocs(postsQ);
    renderPosts(postsSnap, username, isOwner, currentUid);
  } catch (error) {
    console.warn("Index missing or orderBy failed, falling back:", error);

    // fallback query (no orderBy)
    const fallbackQ = query(collection(db, "posts"), where("username", "==", username));
    const fallbackSnap = await getDocs(fallbackQ);
    renderPosts(fallbackSnap, username, isOwner, currentUid);
  }
}

function renderPosts(postsSnap, username, isOwner, currentUid) {
  if (postsSnap.empty) {
    postsEl.innerHTML += "<p>No posts yet.</p>";
    return;
  }

  postsSnap.forEach((p) => {
    const d = p.data();
    const div = document.createElement("div");
    div.classList.add("post");
    const imageHtml = d.imageUrl ? `<img src="${d.imageUrl}" alt="${d.title}" loading="lazy">` : "";
    div.innerHTML = `
      <h3>${d.title}</h3>
      ${d.description ? `<p>${d.description}</p>` : ""}
      ${imageHtml}
      <div class="meta">
        <a href="post.html?id=${p.id}">View Post</a>
        ${isOwner && d.uid === currentUid
          ? `<button class="delete-post secondary" data-id="${p.id}" style="margin-left: auto;"><i class="fa-solid fa-trash"></i> Delete</button>`
          : ""}
      </div>
    `;
    postsEl.appendChild(div);
  });

  document.querySelectorAll(".delete-post").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const postId = e.currentTarget.dataset.id;
      const confirmDelete = confirm("Delete this post?");
      if (!confirmDelete) return;
      await deleteDoc(doc(db, "posts", postId));
      loadPosts(username, isOwner, currentUid);
    });
  });
}

async function saveProfile(uid) {
  const displayName = displayNameInput.value.trim();
  const bio = bioInput.value.trim();

  await setDoc(doc(db, "users", uid), { displayName, bio, updatedAt: new Date() }, { merge: true });
  statusEl.textContent = "Profile updated!";
  setTimeout(() => (statusEl.textContent = ""), 2000);
}

async function deleteAccount(profileUid, currentUid) {
  const user = auth.currentUser;
  const confirmDelete = confirm("This will permanently delete your account and posts. Continue?");
  if (!confirmDelete) return;

  const postsQ = query(collection(db, "posts"), where("uid", "==", currentUid));
  const postsSnap = await getDocs(postsQ);
  for (const d of postsSnap.docs) {
    await deleteDoc(d.ref);
  }

  await deleteDoc(doc(db, "users", profileUid));
  await deleteUser(user);

  alert("Account deleted.");
  window.location.href = "auth.html";
}
