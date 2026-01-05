export function joinGenres(genres) {
  if (!Array.isArray(genres)) return "";
  return genres
    .map((g) => (typeof g === "string" ? g : g?.name))
    .filter(Boolean)
    .join(", ");
}

export function safeText(v, fallback = "-") {
  if (v === null || v === undefined || v === "") return fallback;
  return String(v);
}