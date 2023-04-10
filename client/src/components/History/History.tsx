import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import { api } from '../../services/apis/api';
import Loader from '../Loader';
import TitleCard from '../TitleCard';
import Track from './Track';
import {
  selectRawAllInterval,
  selectRawIntervalDetail,
} from '../../services/redux/modules/user/selector';
import { GridWrapper } from '../Grid';
import TrackHeader from './Track/TrackHeader';
import { useInfiniteScroll } from '../../services/hooks/scrolling';
import CheckboxWithText from '../CheckboxWithText';

export default function History() {
  const { interval } = useSelector(selectRawIntervalDetail);
  const { interval: allInterval } = useSelector(selectRawAllInterval);
  const [followInterval, setFollowInterval] = useState(true);
  const { items, hasMore, onNext } = useInfiniteScroll(
    followInterval ? interval : allInterval,
    api.getTracks,
  );

  const handleSetFollowInterval = useCallback((value: boolean) => {
    setFollowInterval(value);
  }, []);

  return (
    <TitleCard
      title="Your history"
      right={
        <CheckboxWithText
          checked={followInterval}
          onChecked={handleSetFollowInterval}
          text="Follow interval"
        />
      }>
      <InfiniteScroll
        dataLength={items.length}
        next={onNext}
        hasMore={hasMore}
        loader={<Loader />}>
        <GridWrapper>
          <TrackHeader />
          {items.map(item => (
            <Track
              key={item.played_at}
              listenedAt={new Date(item.played_at)}
              artists={item.track.full_artist}
              album={item.track.full_album}
              track={item.track}
            />
          ))}
        </GridWrapper>
      </InfiniteScroll>
    </TitleCard>
  );
}
