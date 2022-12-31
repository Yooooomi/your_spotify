import React, { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSelector } from 'react-redux';
import Header from '../../../components/Header';
import Loader from '../../../components/Loader';
import TitleCard from '../../../components/TitleCard';
import { api, DEFAULT_ITEMS_TO_LOAD } from '../../../services/apis/api';
import { selectRawIntervalDetail } from '../../../services/redux/modules/user/selector';
import { UnboxPromise } from '../../../services/types';
import Genre from './Genre';
import s from './index.module.css';

export default function Genres() {
  const { interval } = useSelector(selectRawIntervalDetail);
  const [items, setItems] = useState<
    UnboxPromise<ReturnType<typeof api['getBestGenres']>>['data']
  >([]);
  const [hasMore, setHasMore] = useState(true);
  const ref = useRef<(force?: boolean) => void>();

  ref.current = async (force = false) => {
    if (!hasMore && !force) return;
    try {
      const result = await api.getBestGenres(
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
        title="Top genres"
        subtitle="Here are the genres you listened to the most"
      />
      <div className={s.content}>
        <TitleCard title="Top genres">
          <Genre line />
          <InfiniteScroll
            next={ref.current}
            hasMore={hasMore}
            dataLength={items.length}
            loader={<Loader />}>
            {items.map(item => (
              <Genre
                key={item.genre._id}
                genre={item.genre}
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
