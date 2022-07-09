import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import Header from '../../../components/Header';
import TitleCard from '../../../components/TitleCard';
import { api } from '../../../services/api';
import { UnboxPromise } from '../../../services/types';
import s from './index.module.css';
import Album from './Album';
import Loader from '../../../components/Loader';
import { selectRawIntervalDetail } from '../../../services/redux/modules/user/selector';

export default function Albums() {
  const { name, interval } = useSelector(selectRawIntervalDetail);
  const [items, setItems] = useState<
    UnboxPromise<ReturnType<typeof api['getBestAlbums']>>['data']
  >([]);
  const [hasMore, setHasMore] = useState(true);

  const fetch = useCallback(async () => {
    if (!hasMore) return;
    try {
      const result = await api.getBestAlbums(
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
    // Initial fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, items.length]);

  useEffect(() => {
    setItems([]);
    setHasMore(true);
  }, [interval]);

  return (
    <div>
      <Header
        title="Top albums"
        subtitle="Here are the albums you listened to the most"
      />
      <div className={s.content}>
        <TitleCard title="Top albums">
          <Album line />
          <InfiniteScroll
            key={name}
            next={fetch}
            hasMore={hasMore}
            dataLength={items.length}
            loader={<Loader />}>
            {items.map(item => (
              <Album
                key={item.album.id}
                artists={[item.artist]}
                album={item.album}
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
