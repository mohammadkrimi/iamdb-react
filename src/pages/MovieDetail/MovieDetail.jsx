import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "./MovieDetail.module.css";

import { apiGet } from "../../services/api.js";
import { endpoints } from "../../services/endpoints.js";

import { AngleLeftIcon, HeartIcon, HeartFilledIcon } from "../../components/Icons";
import { useFavorites } from "../../context/favoritesContext.jsx";

import RatingRing from "../../components/RatingRing/RatingRing.jsx";

function normalizeGenres(genres) {
  if (!Array.isArray(genres)) return "";
  return genres.filter(Boolean).join(", ");
}

function parseRatings(raw) {
  try {
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export default function MovieDetail() {
  const { id } = useParams();
  const movieId = Number(id);

  const navigate = useNavigate();
  const location = useLocation();

  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(movieId);

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia("(max-width: 860px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    const onChange = (e) => setIsMobile(e.matches);

    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  const abortRef = useRef(null);

  useEffect(() => {
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    apiGet(endpoints.movieById(movieId), { signal: controller.signal })
      .then((data) => setMovie(data))
      .catch(() => setMovie(null))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [movieId]);

  const handleBack = () => {
    if (location.state?.from) {
      navigate(-1);
      return;
    }
    navigate("/", { replace: true });
  };

  const handleToggleFavorite = () => {
    if (!movie) return;
    toggleFavorite({ ...movie, id: movieId });
  };

  const title = movie?.title || "";
  const poster = movie?.poster || "";
  const cover = movie?.images?.[0] || "";
  const genresText = useMemo(() => normalizeGenres(movie?.genres), [movie]);
  const desc = movie?.plot || "";

  const year = movie?.year ?? "-";
  const runtime = movie?.runtime ?? "-";
  const rated = movie?.rated ?? "-";

  const director = movie?.director ?? "-";
  const writer = movie?.writer ?? "-";
  const actors = movie?.actors ?? "-";
  const country = movie?.country ?? "-";
  const language = movie?.language ?? "-";
  const awards = movie?.awards ?? "-";

  const rating = Number(movie?.imdb_rating ?? 0) || 0;
  const imdbVotes = movie?.imdb_votes ?? "-";

  const parsed = useMemo(() => parseRatings(movie?.ratings), [movie]);
  const rotten = parsed.find((r) => r?.Source === "Rotten Tomatoes")?.Value ?? "-";
  const meta = parsed.find((r) => r?.Source === "Metacritic")?.Value ?? "-";

  const RING_SIZE = isMobile ? 80 : 120;
  const RING_STROKE = isMobile ? 8 : 10;

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.heroWrapper}>
          <div className={styles.hero}>
            <div className={styles.heroFallback} />

            <button
              className={styles.backBtnOnHero}
              type="button"
              onClick={handleBack}
              aria-label="Back"
            >
              <AngleLeftIcon className={styles.backIcon} />
            </button>
          </div>
        </div>

        <div className={styles.container}>
          <button
            className={styles.backBtnDesktop}
            type="button"
            onClick={handleBack}
            aria-label="Back"
          >
            <AngleLeftIcon className={styles.backIconDesktop} />
          </button>

          <div className={styles.loading}>Loading…</div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className={styles.page}>
        <div className={styles.heroWrapper}>
          <div className={styles.hero}>
            <div className={styles.heroFallback} />

            <button
              className={styles.backBtnOnHero}
              type="button"
              onClick={handleBack}
              aria-label="Back"
            >
              <AngleLeftIcon className={styles.backIcon} />
            </button>
          </div>
        </div>

        <div className={styles.container}>
          <button
            className={styles.backBtnDesktop}
            type="button"
            onClick={handleBack}
            aria-label="Back"
          >
            <AngleLeftIcon className={styles.backIconDesktop} />
          </button>

          <div className={styles.loading}>Movie not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* HERO FULL WIDTH */}
      <div className={styles.heroWrapper}>
        <div className={styles.hero}>
          {cover ? <img className={styles.heroImg} src={cover} alt="" /> : <div className={styles.heroFallback} />}

          {/* mobile back only */}
          <button
            className={styles.backBtnOnHero}
            type="button"
            onClick={handleBack}
            aria-label="Back"
          >
            <AngleLeftIcon className={styles.backIcon} />
          </button>
        </div>
      </div>

      <div className={styles.container}>
        {/* desktop back  */}
        <button
          className={styles.backBtnDesktop}
          type="button"
          onClick={handleBack}
          aria-label="Back"
        >
          <AngleLeftIcon className={styles.backIconDesktop} />
        </button>

        {/*  MOBILE LAYOUT */}
        {isMobile ? (
          <div className={styles.mobileStack}>
            {/* title + genres + desc */}
            <div className={styles.mobileHeader}>
              <h1 className={styles.title}>{title}</h1>
              <div className={styles.genres}>{genresText}</div>
              {desc && <p className={styles.desc}>{desc}</p>}
            </div>

            {/* chips row */}
            <div className={styles.chips}>
              <span className={styles.chip}>{rated}</span>
              <span className={styles.chip}>{year}</span>
              <span className={styles.chip}>{runtime}</span>
            </div>

            {/* scores row (space-between) */}
            <div className={styles.mobileScoresRow}>
              <div className={styles.mobileScoreLeft}>
                <div className={styles.scoreRing} style={{ "--ring-size": `${RING_SIZE}px` }}>
                  <RatingRing value={rating} size={RING_SIZE} stroke={RING_STROKE} />
                  <div className={styles.scoreValue}>
                    {rating ? rating.toFixed(1) : "0.0"}
                  </div>
                </div>

                <div className={styles.scoreText}>
                  <div className={styles.scoreCount}>{imdbVotes}</div>
                  <div className={styles.scoreLabel}>ratings on IMDB</div>
                </div>
              </div>

              <div className={styles.mobileScoreRight}>
                <div>{rotten} on Rotten Tomatoes</div>
                <div>{meta} on Metacritic</div>
              </div>
            </div>

            {/* poster  */}
            <img className={styles.poster} src={poster} alt={title} />

            {/* details */}
            <h2 className={styles.detailsTitle}>Details</h2>

            <div className={styles.detailsTable}>
              <div className={styles.rowLine}>
                <div className={styles.k}>Directors</div>
                <div className={styles.v}>{director}</div>
              </div>

              <div className={styles.rowLine}>
                <div className={styles.k}>Writers</div>
                <div className={styles.v}>{writer}</div>
              </div>

              <div className={styles.rowLine}>
                <div className={styles.k}>Actors</div>
                <div className={styles.v}>{actors}</div>
              </div>

              <div className={styles.rowLine}>
                <div className={styles.k}>Country</div>
                <div className={styles.v}>{country}</div>
              </div>

              <div className={styles.rowLine}>
                <div className={styles.k}>Language</div>
                <div className={styles.v}>{language}</div>
              </div>

              <div className={styles.rowLine}>
                <div className={styles.k}>Awards</div>
                <div className={styles.v}>{awards}</div>
              </div>
            </div>

            
            <div className={styles.mobileFavBar}>
              <button
                className={`${styles.mobileFavBtn} ${fav ? styles.mobileFavBtnActive : ""}`}
                type="button"
                onClick={handleToggleFavorite}
              >
                {fav ? "Remove from Favorite" : "Add to Favorite"}
              </button>
            </div>
          </div>
        ) : (
          
          <div className={styles.grid}>
            <div className={styles.left}>
              <img className={styles.poster} src={poster} alt={title} />

              <div className={styles.ratingBlock}>
                <div className={styles.scoreRow}>
                  <div className={styles.scoreLeft}>
                    <div className={styles.scoreRing} style={{ "--ring-size": `${RING_SIZE}px` }}>
                      <RatingRing value={rating} size={RING_SIZE} stroke={RING_STROKE} />
                      <div className={styles.scoreValue}>
                        {rating ? rating.toFixed(1) : "0.0"}
                      </div>
                    </div>

                    <div className={styles.scoreText}>
                      <div className={styles.scoreCount}>{imdbVotes}</div>
                      <div className={styles.scoreLabel}>ratings on IMDB</div>
                    </div>
                  </div>
                </div>

                <div className={styles.scoreSourcesDesktop}>
                  <div>{rotten} on Rotten Tomatoes</div>
                  <div>{meta} on Metacritic</div>
                </div>
              </div>
            </div>

            <div className={styles.right}>
              <div className={styles.titleRow}>
                <div>
                  <h1 className={styles.title}>{title}</h1>
                  <div className={styles.genres}>{genresText}</div>
                </div>

                <button
                  className={`${styles.inlineFavBtn} ${fav ? styles.favActive : ""}`}
                  type="button"
                  onClick={handleToggleFavorite}
                  aria-label={fav ? "Remove from favorite" : "Add to favorite"}
                  aria-pressed={fav}
                >
                  {fav ? (
                    <HeartFilledIcon className={styles.favIcon} />
                  ) : (
                    <HeartIcon className={styles.favIcon} />
                  )}
                </button>
              </div>

              {desc && <p className={styles.desc}>{desc}</p>}

              <div className={styles.chips}>
                <span className={styles.chip}>{rated}</span>
                <span className={styles.chip}>{year}</span>
                <span className={styles.chip}>{runtime}</span>
              </div>

              <h2 className={styles.detailsTitle}>Details</h2>

              <div className={styles.detailsTable}>
                <div className={styles.rowLine}>
                  <div className={styles.k}>Directors</div>
                  <div className={styles.v}>{director}</div>
                </div>

                <div className={styles.rowLine}>
                  <div className={styles.k}>Writers</div>
                  <div className={styles.v}>{writer}</div>
                </div>

                <div className={styles.rowLine}>
                  <div className={styles.k}>Actors</div>
                  <div className={styles.v}>{actors}</div>
                </div>

                <div className={styles.rowLine}>
                  <div className={styles.k}>Country</div>
                  <div className={styles.v}>{country}</div>
                </div>

                <div className={styles.rowLine}>
                  <div className={styles.k}>Language</div>
                  <div className={styles.v}>{language}</div>
                </div>

                <div className={styles.rowLine}>
                  <div className={styles.k}>Awards</div>
                  <div className={styles.v}>{awards}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}