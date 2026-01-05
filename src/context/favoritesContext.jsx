import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { readJSON, writeJSON } from "../utils/storage.js";

const FavoritesContext = createContext(null);

const STORAGE_KEY = "iamdb:favorites";

function normalizeMovie(movie) {
  if (!movie) return null;

  return {
    id: movie.id,
    title: movie.title || movie.name || "Untitled",
    poster: movie.poster || movie.image || movie.cover || "",
    year: movie.year ?? null,
    country: movie.country ?? null,
    imdb_rating: movie.imdb_rating ?? movie.imdbRate ?? movie.rating ?? null,
    genres: movie.genres ?? [],
  };
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => readJSON(STORAGE_KEY, []));

  useEffect(() => {
    writeJSON(STORAGE_KEY, favorites);
  }, [favorites]);

  const ids = useMemo(() => new Set(favorites.map((m) => m.id)), [favorites]);

  const isFavorite = (id) => ids.has(id);

  const addFavorite = (movie) => {
    const m = normalizeMovie(movie);
    if (!m?.id) return;

    setFavorites((prev) => {
      if (prev.some((x) => x.id === m.id)) return prev;
      return [m, ...prev];
    });
  };

  const removeFavorite = (id) => {
    setFavorites((prev) => prev.filter((m) => m.id !== id));
  };

  const toggleFavorite = (movie) => {
    const id = movie?.id;
    if (!id) return;

    setFavorites((prev) => {
      const exists = prev.some((x) => x.id === id);
      if (exists) return prev.filter((x) => x.id !== id);
      const m = normalizeMovie(movie);
      if (!m) return prev;
      return [m, ...prev];
    });
  };

  const value = useMemo(
    () => ({ favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite }),
    [favorites, ids]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");
  return ctx;
}