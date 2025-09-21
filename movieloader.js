const categoryMap = {
  "Popular": "popularContainer",
  "Comedy": "comedyContainer",
  "Horror": "horrorContainer",
  "Action": "actionContainer"
};

function createMovieImage(movie) {
  const img = document.createElement("img");
  img.src = "img/" + movie.name + ".jpg";
  return img;
}

function loadMovies() {
  fetch("movie.json")
    .then(response => response.json())
    .then(movies => {
      movies.forEach(movie => {
        movie.category.forEach(cat => {
          const container = document.getElementById(categoryMap[cat]);
          if (container) {
            container.appendChild(createMovieImage(movie));
          }
        });
      });
    });
}

document.addEventListener("DOMContentLoaded", loadMovies);