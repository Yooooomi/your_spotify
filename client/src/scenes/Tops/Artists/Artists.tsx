import React, { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSelector } from 'react-redux';
import Header from '../../../components/Header';
import Loader from '../../../components/Loader';
import TitleCard from '../../../components/TitleCard';
import { api, DEFAULT_ITEMS_TO_LOAD } from '../../../services/apis/api';
import { selectRawIntervalDetail } from '../../../services/redux/modules/user/selector';
import { UnboxPromise } from '../../../services/types';
import Artist from './Artist';
import s from './index.module.css';

export default function Artists() {
  const { interval } = useSelector(selectRawIntervalDetail);
  const [items, setItems] = useState<
    UnboxPromise<ReturnType<typeof api['getBestArtists']>>['data']
  >([]);
  const [hasMore, setHasMore] = useState(true);
  const ref = useRef<(force?: boolean) => void>();

  ref.current = async (force = false) => {
    if (!hasMore && !force) return;
    try {
      const result = await api.getBestArtists(
        interval.start,
        interval.end,
        DEFAULT_ITEMS_TO_LOAD,
        items.length,
      );
      setItems([...items, ...result.data]);
      setHasMore(result.data.length === DEFAULT_ITEMS_TO_LOAD);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setHasMore(false);
    setItems([]);
    setTimeout(() => ref.current?.(true), 0);
  }, [interval]);

  return (
    <div>
      <Header
        title="Top artists"
        subtitle="Here are the artists you listened to the most"
      />
      <div className={s.content}>
        <TitleCard title="Top artists">
          <Artist line />
          <InfiniteScroll
            next={ref.current}
            hasMore={hasMore}
            dataLength={items.length}
            loader={<Loader />}>
            {items.map(item => (
              <Artist
                key={item.artist.id}
                artist={item.artist}
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
