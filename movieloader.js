const firebaseConfig = {
  apiKey: "AIzaSyBvoeKGw2_IMsAhTS1oLXzko2SVIjwn3Io",
  authDomain: "idk213.firebaseapp.com",
  projectId: "idk213",
  storageBucket: "idk213.firebasestorage.app",
  messagingSenderId: "41057025557",
  appId: "1:41057025557:web:03652b64df0c086c8c581c"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const categoryMap = {
  "Popular": "popularContainer",
  "Comedy": "comedyContainer",
  "Horror": "horrorContainer",
  "Action": "actionContainer"
};

function createMovieImage(movie) {
  const img = document.createElement("img");
  img.src = "img/" + movie.name + ".jpg";
  img.alt = movie.name;
  return img;
}

function loadMoviesFromFirestore() {
  db.collection("movies").get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const movie = doc.data();
        movie.category.forEach(cat => {
          const containerId = categoryMap[cat];
          if (containerId) {
            const container = document.getElementById(containerId);
            container.appendChild(createMovieImage(movie));
          }
        });
      });
      console.log("Movies loaded from Firestore!");
    })
    .catch(error => console.error("Error loading movies from Firestore:", error));
}

document.addEventListener("DOMContentLoaded", loadMoviesFromFirestore);