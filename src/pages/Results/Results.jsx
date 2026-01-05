import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchBar from "../../components/SearchBar/SearchBar.jsx";
import MovieList from "../../components/MovieList/MovieList.jsx";
import { apiGet } from "../../services/api.js";
import { endpoints } from "../../services/endpoints.js";
import { getSearchParams } from "../../utils/query.js";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll.js";
import { useDebouncedValue } from "../../hooks/useDebouncedValue.js";
import styles from "./Results.module.css";
import { AngleLeftIcon } from "../../components/Icons/index.jsx";
import { useSpeechToText } from "../../hooks/useSpeechToText.js";

function extractMovies(resp) {
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp?.data)) return resp.data;
  if (Array.isArray(resp?.movies)) return resp.movies;
  if (Array.isArray(resp?.results)) return resp.results;
  return [];
}

export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();

  const { q, genre } = useMemo(
    () => getSearchParams(location.search),
    [location.search]
  );

  const [query, setQuery] = useState(q);
  const debouncedQuery = useDebouncedValue(query, 450);
  const [error, setError] = useState("");

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loadingFirst, setLoadingFirst] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const abortRef = useRef(null);

  //  Speech hook
  const speech = useSpeechToText({ lang: "en-US" });

  //  when speech transcript updates → fill the input
  useEffect(() => {
    if (!speech.transcript) return;
    setQuery(speech.transcript);
    if (error) setError("");
  }, [speech.transcript]);

  useEffect(() => {
    const trimmed = query.trim();
    const params = new URLSearchParams(location.search);

    if (trimmed) {
      params.set("q", trimmed);
      params.delete("genre");
    } else {
      params.delete("q");
    }

    navigate(
      { pathname: "/results", search: params.toString() ? `?${params}` : "" },
      { replace: true }
    );
  }, [query]);

  const buildUrl = useCallback(
    (p) => {
      const activeQ = debouncedQuery.trim();
      if (genre) return endpoints.moviesByGenre(genre, p);
      if (activeQ) return endpoints.searchMovies(activeQ, p);
      return endpoints.movies(p);
    },
    [debouncedQuery, genre]
  );

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
    setLoadingFirst(true);
  }, [debouncedQuery, genre]);

  useEffect(() => {
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoadingFirst(true);
    apiGet(buildUrl(1), { signal: controller.signal })
      .then((data) => {
        const items = extractMovies(data);
        setMovies(items);
        setHasMore(items.length > 0);
      })
      .catch(() => {
        setMovies([]);
        setHasMore(false);
      })
      .finally(() => setLoadingFirst(false));

    return () => controller.abort();
  }, [buildUrl]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingFirst || loadingMore) return;

    const next = page + 1;
    setLoadingMore(true);

    apiGet(buildUrl(next))
      .then((data) => {
        const list = extractMovies(data);
        if (!list.length) {
          setHasMore(false);
          return;
        }
        setMovies((prev) => [...prev, ...list]);
        setPage(next);
      })
      .finally(() => setLoadingMore(false));
  }, [hasMore, loadingFirst, loadingMore, page, buildUrl]);

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    enabled: hasMore && !loadingFirst,
  });

  const handleSubmitSearch = () => {
    if (!query.trim()) {
      setError("Please enter a search term.");
      return;
    }
    setError("");
  };

  const handleVoiceClick = () => {
    if (!speech.supported) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }
    speech.toggle();
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topRow}>
          <button
            className={styles.backBtn}
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <AngleLeftIcon className={styles.backIcon} />
          </button>

          <div className={styles.titleBlock}>
            <div className={styles.title}>Result</div>
            <div className={styles.subtitle}>
              {q ? `for "${q}"` : genre ? `for "${genre}"` : ""}
            </div>
          </div>

          <div className={styles.rightSpacer} />
        </div>

        <div className={styles.searchRow}>
          <SearchBar
            autoFocus
            value={query}
            onChange={(v) => {
              setQuery(v);
              if (error) setError("");
            }}
            onSubmit={handleSubmitSearch}
            onVoiceClick={handleVoiceClick}
            error={error}
            placeholder="Search Query"
          />
        </div>

        <div className={styles.list}>
          {loadingFirst ? (
            <div className={styles.loadingText}>Loading…</div>
          ) : movies.length === 0 ? (
            <div className={styles.empty}>No results found.</div>
          ) : (
            <MovieList
              movies={movies}
              onOpenMovie={(movie) =>
                navigate(`/movie/${movie.id}`, { state: { from: location } })
              }
            />
          )}

          {loadingMore && (
            <div className={styles.loadingMore}>Loading more…</div>
          )}
          <div ref={sentinelRef} className={styles.sentinel} />
        </div>
      </div>
    </div>
  );
}