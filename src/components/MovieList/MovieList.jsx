import MovieListItem from "../MovieListItem/MovieListItem.jsx";

export default function MovieList({ movies, onOpenMovie }) {
  return (
    <div>
      {movies.map((movie) => (
        <MovieListItem key={movie.id} movie={movie} onOpenMovie={onOpenMovie} />
      ))}
    </div>
  );
}