export function getSearchParams(search) {
  const params = new URLSearchParams(search);
  const q = params.get("q")?.trim() || "";
  const genre = params.get("genre")?.trim() || "";
  return { q, genre };
}