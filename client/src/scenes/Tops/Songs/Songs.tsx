import React, { useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSelector } from 'react-redux';
import Header from '../../../components/Header';
import Loader from '../../../components/Loader';
import TitleCard from '../../../components/TitleCard';
import { api } from '../../../services/api';
import { selectRawIntervalDetail } from '../../../services/redux/modules/user/selector';
import { UnboxPromise } from '../../../services/types';
import s from './index.module.css';
import Track from './Track';

export default function Songs() {
  const { name, interval } = useSelector(selectRawIntervalDetail);
  const [items, setItems] = useState<
    UnboxPromise<ReturnType<typeof api['getBestSongs']>>['data']
  >([]);
  const [hasMore, setHasMore] = useState(true);

  const fetch = useCallback(async () => {
    if (!hasMore) return;
    try {
      const result = await api.getBestSongs(
        interval.start,
        interval.end,
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
  }, [interval, items.length]);

  useEffect(() => {
    setItems([]);
    setHasMore(true);
  }, [interval]);

  return (
    <div>
      <Header
        title="Top songs"
        subtitle="Here are the songs you listened to the most"
      />
      <div className={s.content}>
        <TitleCard title="Top songs">
          <Track line playable />
          <InfiniteScroll
            key={name}
            next={fetch}
            hasMore={hasMore}
            dataLength={items.length}
            loader={<Loader />}>
            {items.map(item => (
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
