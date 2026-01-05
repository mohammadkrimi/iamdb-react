import styles from "./MovieListItem.module.css";
import { joinGenres, safeText } from "../../utils/formatters.js";
import { useFavorites } from "../../context/favoritesContext.jsx";
import { HeartIcon, HeartFilledIcon } from "../Icons/index.jsx"

export default function MovieListItem({ movie, onOpenMovie }) {
  const { isFavorite, toggleFavorite } = useFavorites();

  const fav = isFavorite(movie?.id);

  const title = movie?.title || movie?.name || "Untitled";
  const year = safeText(movie?.year);
  const country = safeText(movie?.country);
  const rating = safeText(movie?.imdb_rating ?? movie?.imdbRate ?? movie?.rating);
  const poster = movie?.poster || movie?.image || movie?.cover || "";
  const genres = joinGenres(movie?.genres);

  return (
    <div className={styles.row}>
      <button className={styles.main} type="button" onClick={() => onOpenMovie(movie)}>
        <img className={styles.poster} src={poster} alt={title} loading="lazy" />

        <div className={styles.meta}>
          <div className={styles.title}>{title}</div>

          {genres && <div className={styles.genres}>{genres}</div>}

          <div className={styles.sub}>
            <span>{year}</span>
            <span className={styles.dot}>•</span>
            <span>{country}</span>
            <span className={styles.dot}>•</span>
            <span className={styles.star}>★</span>
            <span className={styles.rating}>{rating}</span>
          </div>
        </div>
      </button>

      <button
        className={`${styles.heartBtn} ${fav ? styles.heartActive : ""}`}
        type="button"
        aria-label={fav ? "Remove from favorite" : "Add to favorite"}
        aria-pressed={fav}
        onClick={(e) => {
          e.stopPropagation(); 
          toggleFavorite(movie);
        }}
      >
        {fav ? <HeartFilledIcon className={styles.heartIcon} /> : <HeartIcon className={styles.heartIcon} />}
      </button>
    </div>
  );
}