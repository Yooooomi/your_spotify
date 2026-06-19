import { useState, useRef, useEffect } from 'react';
import { DEFAULT_ITEMS_TO_LOAD } from '../apis/api';
import { Interval } from '../intervals';

function isDocumentScrollable() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return true;
  }
  return document.documentElement.scrollHeight > window.innerHeight;
}

export function useInfiniteScroll<T>(
  interval: Interval,
  call: (
    start: Date,
    end: Date,
    nb: number,
    offset: number,
  ) => Promise<{ data: T[] }>,
  filter?: (item: T) => boolean,
) {
  const [items, setItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [autoFillCycle, setAutoFillCycle] = useState(0);

  const ref = useRef<(force?: boolean) => Promise<void>>(async () => {});
  const isFetchingRef = useRef(false);
  const generationRef = useRef(0);
  const fetchedCountRef = useRef(0);

  ref.current = async (isNew = false) => {
    if (!hasMore && !isNew) return;
    if (isFetchingRef.current) return;

    const generation = generationRef.current;
    isFetchingRef.current = true;
    try {
      const result = await call(
        interval.start,
        interval.end,
        DEFAULT_ITEMS_TO_LOAD,
        isNew ? 0 : fetchedCountRef.current,
      );

      // Ignore late responses from a previous interval generation
      if (generation !== generationRef.current) return;

      const filteredData = filter ? result.data.filter(filter) : result.data;

      fetchedCountRef.current = isNew
        ? result.data.length
        : fetchedCountRef.current + result.data.length;

      setItems(prevItems => {
        if (isNew) return filteredData;
        return [...prevItems, ...filteredData];
      });

      const nextHasMore = result.data.length === DEFAULT_ITEMS_TO_LOAD;
      setHasMore(nextHasMore);
      setAutoFillCycle(prev => prev + 1);
    } catch (e) {
      console.error(e);
    } finally {
      if (generation === generationRef.current) {
        isFetchingRef.current = false;
      }
    }
  };

  const onNext = (force = false) => {
    void ref.current(force);
  };

  useEffect(() => {
    generationRef.current += 1;
    isFetchingRef.current = false;
    fetchedCountRef.current = 0;

    setHasMore(true);
    setItems([]);
    setAutoFillCycle(0);
    // Defer the first load until after reset state is committed
    const timeout = setTimeout(() => {
      void ref.current(true);
    }, 0);

    return () => clearTimeout(timeout);
  }, [interval]);

  useEffect(() => {
    if (autoFillCycle === 0 || !hasMore) return;
    if (isFetchingRef.current) return;
    if (isDocumentScrollable()) return;

    // Trigger sequential page loads until the viewport becomes scrollable
    const timeout = setTimeout(() => {
      void ref.current();
    }, 0);

    return () => clearTimeout(timeout);
  }, [autoFillCycle, hasMore]);

  return { items, hasMore, onNext };
}
