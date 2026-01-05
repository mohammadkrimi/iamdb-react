const BASE_URL = "https://moviesapi.codingfront.dev/api/v1";

export const endpoints = {
  movies: (page = 1) => `${BASE_URL}/movies?page=${page}`,
  searchMovies: (q, page = 1) => `${BASE_URL}/movies?q=${encodeURIComponent(q)}&page=${page}`,
  genres: () => `${BASE_URL}/genres`,
  moviesByGenre: (genreName, page = 1) =>
    `${BASE_URL}/genres/${encodeURIComponent(genreName)}/movies?page=${page}`,
  movieById: (id) => `${BASE_URL}/movies/${id}`,
};