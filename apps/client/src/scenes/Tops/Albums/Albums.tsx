import { useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import Header from "../../../components/Header";
import TitleCard from "../../../components/TitleCard";
import { api } from "../../../services/apis/api";
import Loader from "../../../components/Loader";
import { selectRawIntervalDetail } from "../../../services/redux/modules/user/selector";
import { GridWrapper } from "../../../components/Grid";
import { useInfiniteScroll } from "../../../services/hooks/scrolling";
import AlbumHeader from "./Album/AlbumHeader";
import Album from "./Album";
import s from "./index.module.css";

export default function Albums() {
  const { interval } = useSelector(selectRawIntervalDetail);
  const { items, hasMore, onNext } = useInfiniteScroll(
    interval,
    api.getBestAlbums,
  );

  return (
    <div>
      <Header
        title="Top albums"
        subtitle="Here are the albums you listened to the most"
      />
      <div className={s.content}>
        <TitleCard title="Top albums" noBorder>
          <InfiniteScroll
            next={onNext}
            hasMore={hasMore}
            dataLength={items.length}
            loader={<Loader />}>
            <GridWrapper>
              <AlbumHeader />
              {items.map((item, rank) => (
                <Album
                  key={item.album.id}
                  rank={rank + 1}
                  artists={[item.artist]}
                  album={item.album}
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
