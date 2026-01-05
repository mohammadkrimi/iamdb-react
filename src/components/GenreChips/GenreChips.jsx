import styles from "./GenreChips.module.css";
import { AngleRightIcon } from "../Icons/index.jsx"

export default function GenreChips({
  genres,
  expanded,
  onToggle,
  onSelectGenre,
  loading,
}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        {loading ? (
          <>
            <div className={styles.skelChip} />
            <div className={styles.skelChip} />
            <div className={styles.skelChip} />
            <div className={styles.skelChip} />
          </>
        ) : (
          genres.map((genre) => (
            <button
              key={genre.id}
              className={styles.chip}
              type="button"
              onClick={() => onSelectGenre(genre.name)}
            >
              {genre.name}
            </button>
          ))
        )}

        <button
          className={styles.more}
          type="button"
          onClick={onToggle}
          disabled={loading}
        >
          {expanded ? "Show Less" : "Show More"}
          <AngleRightIcon className={`${styles.arrow} icon`} />
        </button>
      </div>
    </div>
  );
}
