import { useState, useRef, useEffect } from "react";
import { DEFAULT_ITEMS_TO_LOAD } from "../apis/api";
import { Interval } from "../intervals";

export function useInfiniteScroll<T>(
  interval: Interval,
  call: (
    start: Date,
    end: Date,
    nb: number,
    offset: number,
  ) => Promise<{ data: T[] }>,
) {
  const [items, setItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const ref = useRef<(force?: boolean) => void>();

  ref.current = async (isNew = false) => {
    if (!hasMore && !isNew) return;
    try {
      const result = await call(
        interval.start,
        interval.end,
        DEFAULT_ITEMS_TO_LOAD,
        isNew ? 0 : items.length,
      );
      if (isNew) {
        setItems([...result.data] as T[]);
      } else {
        setItems([...items, ...result.data] as T[]);
      }
      setHasMore(result.data.length === DEFAULT_ITEMS_TO_LOAD);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setHasMore(true);
    setItems([]);
    setTimeout(() => ref.current?.(true), 0);
  }, [interval]);

  return { items, hasMore, onNext: ref.current };
}
