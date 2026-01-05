import { useEffect, useRef } from "react";

export function useInfiniteScroll({ onLoadMore, enabled }) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { root: null, rootMargin: "600px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onLoadMore, enabled]);

  return { sentinelRef };
}