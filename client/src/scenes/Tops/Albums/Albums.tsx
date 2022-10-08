import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import Header from '../../../components/Header';
import TitleCard from '../../../components/TitleCard';
import { api, DEFAULT_ITEMS_TO_LOAD } from '../../../services/apis/api';
import { UnboxPromise } from '../../../services/types';
import s from './index.module.css';
import Album from './Album';
import Loader from '../../../components/Loader';
import { selectRawIntervalDetail } from '../../../services/redux/modules/user/selector';

export default function Albums() {
  const { interval } = useSelector(selectRawIntervalDetail);
  const [items, setItems] = useState<
    UnboxPromise<ReturnType<typeof api['getBestAlbums']>>['data']
  >([]);
  const [hasMore, setHasMore] = useState(true);
  const ref = useRef<(force?: boolean) => void>();

  ref.current = async (force = false) => {
    if (!hasMore && !force) return;
    try {
      const result = await api.getBestAlbums(
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
        title="Top albums"
        subtitle="Here are the albums you listened to the most"
      />
      <div className={s.content}>
        <TitleCard title="Top albums">
          <Album line />
          <InfiniteScroll
            next={ref.current}
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
