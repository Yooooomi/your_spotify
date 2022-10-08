import React, { useEffect, useMemo, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSelector } from 'react-redux';
import AddToPlaylist from '../../../components/AddToPlaylist';
import Header from '../../../components/Header';
import Loader from '../../../components/Loader';
import { DEFAULT_PLAYLIST_NB } from '../../../components/PlaylistDialog/PlaylistDialog';
import TitleCard from '../../../components/TitleCard';
import {
  api,
  ApiData,
  DEFAULT_ITEMS_TO_LOAD,
} from '../../../services/apis/api';
import { PlaylistContext } from '../../../services/redux/modules/playlist/types';
import { selectRawIntervalDetail } from '../../../services/redux/modules/user/selector';
import s from './index.module.css';
import Track from './Track';

export default function Songs() {
  const { interval } = useSelector(selectRawIntervalDetail);
  const [items, setItems] = useState<ApiData<'getBestSongs'>>([]);
  const [hasMore, setHasMore] = useState(true);
  const ref = useRef<(force?: boolean) => void>();

  ref.current = async (force = false) => {
    if (!hasMore && !force) return;
    try {
      const result = await api.getBestSongs(
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

  const context = useMemo<PlaylistContext>(
    () => ({
      type: 'top',
      nb: DEFAULT_PLAYLIST_NB,
      interval: {
        start: interval.start.getTime(),
        end: interval.end.getTime(),
      },
    }),
    [interval.end, interval.start],
  );

  return (
    <div>
      <Header
        title="Top songs"
        subtitle="Here are the songs you listened to the most"
      />
      <div className={s.content}>
        <TitleCard
          title="Top songs"
          right={<AddToPlaylist context={context} />}>
          <Track line playable />
          <InfiniteScroll
            next={ref.current}
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
