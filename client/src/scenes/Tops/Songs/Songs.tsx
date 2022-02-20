import React, { useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Header from '../../../components/Header';
import { IntervalDetail, intervals } from '../../../components/IntervalSelector/IntervalSelector';
import Loader from '../../../components/Loader';
import TitleCard from '../../../components/TitleCard';
import { api } from '../../../services/api';
import { UnboxPromise } from '../../../services/types';
import s from './index.module.css';
import Track from './Track';

export default function Songs() {
  const [interval, setInterval] = useState(intervals[0]);
  const [items, setItems] = useState<UnboxPromise<ReturnType<typeof api['getBestSongs']>>['data']>(
    [],
  );
  const [hasMore, setHasMore] = useState(true);

  const fetch = useCallback(async () => {
    if (!hasMore) return;
    try {
      const result = await api.getBestSongs(
        interval.interval.start,
        interval.interval.end,
        10,
        items.length,
      );
      setItems([...items, ...result.data]);
      setHasMore(result.data.length === 10);
    } catch (e) {
      console.error(e);
    }
  }, [hasMore, interval, items]);

  useEffect(() => {
    if (items.length === 0) {
      fetch();
    }
    // initial fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval]);

  const changeInterval = useCallback((newInterval: IntervalDetail) => {
    setInterval(newInterval);
    setItems([]);
    setHasMore(true);
  }, []);

  return (
    <div>
      <Header
        title="Top songs"
        subtitle="Here are the songs you listened to the most"
        interval={interval}
        onChange={changeInterval}
      />
      <div className={s.content}>
        <TitleCard title="Top songs">
          <Track line playable />
          <InfiniteScroll
            next={fetch}
            hasMore={hasMore}
            dataLength={items.length}
            loader={<Loader />}>
            {items.map((item) => (
              <Track
                playable
                key={item.track.id}
                track={item.track}
                album={item.album}
                artists={[item.artist]}
                count={item.count}
                totalCount={item.total_count}
                duration={item.duration_ms}
                totalDuration={item.total_duration_ms}
              />
            ))}
          </InfiniteScroll>
        </TitleCard>
      </div>
    </div>
  );
}
