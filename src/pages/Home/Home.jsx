import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/SearchBar/SearchBar.jsx";
import GenreChips from "../../components/GenreChips/GenreChips.jsx";
import { apiGet } from "../../services/api.js";
import { endpoints } from "../../services/endpoints.js";
import styles from "./Home.module.css";
import { useSpeechToText } from "../../hooks/useSpeechToText.js";

export default function Home() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const [genres, setGenres] = useState([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const abortRef = useRef(null);

  //  Speech hook
  const speech = useSpeechToText({ lang: "en-US" });

  useEffect(() => {
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    setGenresLoading(true);
    apiGet(endpoints.genres(), { signal: controller.signal })
      .then((data) => setGenres(Array.isArray(data) ? data : []))
      .catch(() => setGenres([]))
      .finally(() => setGenresLoading(false));

    return () => controller.abort();
  }, []);

  const visibleGenres = useMemo(() => {
    if (expanded) return genres;
    return genres.slice(0, 4);
  }, [genres, expanded]);

  //  when speech transcript updates = fill the input
  useEffect(() => {
    if (!speech.transcript) return;
    setQuery(speech.transcript);
    if (error) setError("");
  }, [speech.transcript]);

  const submitSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Please enter a search term.");
      return;
    }
    setError("");
    navigate(`/results?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSelectGenre = (genre) => {
    setError("");
    navigate(`/results?genre=${encodeURIComponent(genre)}`);
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
        <h1 className={styles.logo}>IAMDB</h1>

        <SearchBar
          autoFocus
          value={query}
          onChange={(v) => {
            setQuery(v);
            if (error) setError("");
          }}
          onSubmit={submitSearch}
          onVoiceClick={handleVoiceClick}
          error={error}
        />

        <GenreChips
          genres={visibleGenres}
          expanded={expanded}
          onToggle={() => setExpanded((p) => !p)}
          onSelectGenre={handleSelectGenre}
          loading={genresLoading}
        />
      </div>
    </div>
  );
}