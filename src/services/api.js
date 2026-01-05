export async function apiGet(url, { signal } = {}) {
  const res = await fetch(url, { signal });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed: ${res.status} ${text}`);
  }

  return res.json();
}