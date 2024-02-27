import InfiniteScroll from "react-infinite-scroll-component";
import { useSelector } from "react-redux";
import { GridWrapper } from "../../../components/Grid";
import Header from "../../../components/Header";
import Loader from "../../../components/Loader";
import TitleCard from "../../../components/TitleCard";
import { api } from "../../../services/apis/api";
import { useInfiniteScroll } from "../../../services/hooks/scrolling";
import { selectRawIntervalDetail } from "../../../services/redux/modules/user/selector";
import Artist from "./Artist";
import ArtistHeader from "./Artist/ArtistHeader";
import s from "./index.module.css";

export default function Artists() {
  const { interval } = useSelector(selectRawIntervalDetail);
  const { items, hasMore, onNext } = useInfiniteScroll(
    interval,
    api.getBestArtists,
  );

  return (
    <div>
      <Header
        title="Top artists"
        subtitle="Here are the artists you listened to the most"
      />
      <div className={s.content}>
        <TitleCard title="Top artists" noBorder>
          <InfiniteScroll
            next={onNext}
            hasMore={hasMore}
            dataLength={items.length}
            loader={<Loader />}>
            <GridWrapper>
              <ArtistHeader />
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
            </GridWrapper>
          </InfiniteScroll>
        </TitleCard>
      </div>
    </div>
  );
}
