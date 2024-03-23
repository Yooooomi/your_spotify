import { CircularProgress, Grid } from "@mui/material";
import Header from "../../components/Header";
import TitleCard from "../../components/TitleCard";
import { TrackStatsResponse } from "../../services/apis/api";
import { buildFromDateId } from "../../services/stats";
import Text from "../../components/Text";
import InlineArtist from "../../components/InlineArtist";
import ImageTwoLines from "../../components/ImageTwoLines";
import IdealImage from "../../components/IdealImage";
import InlineAlbum from "../../components/InlineAlbum";
import { DateFormatter } from "../../services/date";
import FirstAndLast from "./FirstAndLast";
import TrackRank from "./TrackRank/TrackRank";
import s from "./index.module.css";

interface TrackStatsProps {
  trackId: string;
  stats: TrackStatsResponse;
}

export default function TrackStats({ trackId, stats }: TrackStatsProps) {
  if (!stats) {
    return <CircularProgress />;
  }

  const [bestPeriod, secondBestPeriod] = stats.bestPeriod;

  return (
    <div>
      <Header
        left={
          <IdealImage
            className={s.headerimage}
            images={stats.album.images}
            size={60}
            alt="Album"
          />
        }
        title={stats.track.name}
        subtitle={<InlineArtist artist={stats.artist} />}
        hideInterval
      />
      <div className={s.content}>
        <div className={s.header}>
          <TrackRank trackId={trackId} />
        </div>
        <Grid
          container
          justifyContent="flex-start"
          alignItems="flex-start"
          spacing={2}
          style={{ marginTop: 0 }}>
          <Grid
            container
            item
            xs={12}
            lg={6}
            justifyContent="flex-start"
            alignItems="flex-start"
            spacing={2}>
            <Grid item xs={12}>
              <TitleCard title="Context" contentClassName={s.context}>
                <ImageTwoLines
                  image={<IdealImage images={stats.artist.images} size={48} />}
                  first={<InlineArtist artist={stats.artist} />}
                  second="Artist"
                />
                <ImageTwoLines
                  image={<IdealImage images={stats.album.images} size={48} />}
                  first={<InlineAlbum album={stats.album} />}
                  second="Album"
                />
              </TitleCard>
            </Grid>
            <Grid item xs={12}>
              <TitleCard title="Times listened">
                <Text element="strong" className={s.songslistened}>
                  {stats.total.count}
                </Text>
              </TitleCard>
            </Grid>
            <Grid item xs={12}>
              <FirstAndLast
                firstDate={new Date(stats.firstLast.first.played_at)}
                lastDate={new Date(stats.firstLast.last.played_at)}
              />
            </Grid>
            <Grid item xs={12}>
              <TitleCard
                title={`Top two months you listened to ${stats.track.name}`}>
                {bestPeriod && (
                  <div className={s.bestperiod}>
                    <Text element="strong">
                      {DateFormatter.toMonthStringYear(
                        buildFromDateId(bestPeriod._id),
                      )}
                    </Text>
                    <Text>
                      {bestPeriod.count} times (
                      {Math.floor((bestPeriod.count / bestPeriod.total) * 100)}%
                      of total time)
                    </Text>
                  </div>
                )}
                {secondBestPeriod && (
                  <div className={s.bestperiod}>
                    <Text element="strong">
                      {DateFormatter.toMonthStringYear(
                        buildFromDateId(secondBestPeriod._id),
                      )}
                    </Text>
                    <Text>
                      {secondBestPeriod.count} times (
                      {Math.floor(
                        (secondBestPeriod.count / secondBestPeriod.total) * 100,
                      )}
                      % of total time)
                    </Text>
                  </div>
                )}
              </TitleCard>
            </Grid>
          </Grid>
          <Grid item lg={6} xs={12}>
            <TitleCard title="Recently played on">
              {stats.recentHistory.map(info => (
                <ImageTwoLines
                  className={s.recentitem}
                  key={info.id}
                  image={<IdealImage images={stats.album.images} size={48} />}
                  first={stats.track.name}
                  second={DateFormatter.toMinuteHourDayMonthYear(
                    new Date(info.played_at),
                  )}
                />
              ))}
            </TitleCard>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
