// Map section IDs
const sections = {
  "Popular": document.getElementById("popularContainer"),
  "Comedy": document.getElementById("comedyContainer"),
  "Horror": document.getElementById("horrorContainer"),
  "Action": document.getElementById("actionContainer")
};

// Load JSON from file
fetch("Scripts/movies.json")
  .then(response => response.json())   // parse JSON
  .then(movies => {
    movies.forEach(movie => {
      movie.category.forEach(cat => {
        if (sections[cat]) {
          const card = document.createElement("div");
          card.className = "movie-card";
          card.innerHTML = `
            <h3>${movie.name}</h3>
            <p>${movie.description}</p>
          `;
          sections[cat].appendChild(card);
        }
      });
    });
  })
  .catch(error => console.error("Error loading JSON:", error));
