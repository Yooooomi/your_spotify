import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSelector } from 'react-redux';
import Header from '../../../components/Header';
import Loader from '../../../components/Loader';
import TitleCard from '../../../components/TitleCard';
import { api } from '../../../services/apis/api';
import { useInfiniteScroll } from '../../../services/hooks/scrolling';
import { selectRawIntervalDetail } from '../../../services/redux/modules/user/selector';
import Genre from './Genre';
import GenreHeader from './Genre/GenreHeader';
import s from './index.module.css';
import { GridWrapper } from '../../../components/Grid';

export default function Genres() {
  const { interval } = useSelector(selectRawIntervalDetail);
  const { items, hasMore, onNext } = useInfiniteScroll(
    interval,
    api.getBestGenres,
  );

  return (
    <div>
      <Header
        title="Top genres"
        subtitle="Here are the genres you listened to the most"
      />
      <div className={s.content}>
        <TitleCard title="Top genres">
          <InfiniteScroll
            next={onNext}
            hasMore={hasMore}
            dataLength={items.length}
            loader={<Loader />}>
            <GridWrapper>
              <GenreHeader />
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
            </GridWrapper>
          </InfiniteScroll>
        </TitleCard>
      </div>
    </div>
  );
}
