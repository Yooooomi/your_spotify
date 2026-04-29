import { Fragment } from "react";
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
  const albumById = Object.fromEntries(
    stats.listenedOn.map(item => [item.album.id, item.album]),
  );

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
        subtitle={stats.artists.map((artist, index) => (
          <Fragment key={artist.id}>
            <InlineArtist artist={artist} size='normal' />
            {index < stats.artists.length - 1 && ", "}
          </Fragment>
        ))}
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
            size={{ xs: 12, lg: 6 }}
            justifyContent="flex-start"
            alignItems="flex-start"
            spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TitleCard title="Artists">
                {stats.artists.map((artist, index) => (
                  <ImageTwoLines
                    key={artist.id}
                    className={s.recentitem}
                    image={<IdealImage images={artist.images} size={48} />}
                    first={<InlineArtist artist={artist} size='normal' />}
                    second={index === 0 ? "Main artist" : "Featured artist"}
                  />
                ))}
              </TitleCard>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TitleCard title="Listened on">
                {stats.listenedOn.map(({ album, count }) => (
                  <ImageTwoLines
                    key={album.id}
                    className={s.recentitem}
                    image={<IdealImage images={album.images} size={48} />}
                    first={<InlineAlbum album={album} size='normal' />}
                    second={`${count} ${count === 1 ? "time" : "times"}`}
                  />
                ))}
              </TitleCard>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TitleCard title="Times listened">
                <Text element="strong" size='big'>
                  {stats.total.count}
                </Text>
              </TitleCard>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FirstAndLast
                firstDate={new Date(stats.firstLast.first.played_at)}
                lastDate={new Date(stats.firstLast.last.played_at)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TitleCard
                title={`Top two months you listened to ${stats.track.name}`}>
                {bestPeriod && (
                  <div className={s.bestperiod}>
                    <Text element="strong" size='normal'>
                      {DateFormatter.toMonthStringYear(
                        buildFromDateId(bestPeriod._id),
                      )}
                    </Text>
                    <Text size="normal">
                      {bestPeriod.count} times (
                      {Math.floor((bestPeriod.count / bestPeriod.total) * 100)}%
                      of total time)
                    </Text>
                  </div>
                )}
                {secondBestPeriod && (
                  <div className={s.bestperiod}>
                    <Text element="strong" size='normal'>
                      {DateFormatter.toMonthStringYear(
                        buildFromDateId(secondBestPeriod._id),
                      )}
                    </Text>
                    <Text size="normal">
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
          <Grid size={{ lg: 6, xs: 12 }}>
            <TitleCard title="Recently played on">
              {stats.recentHistory.map(info => {
                const album = albumById[info.albumId] ?? stats.album;
                return (
                  <ImageTwoLines
                    className={s.recentitem}
                    key={info._id}
                    image={<IdealImage images={album.images} size={48} />}
                    first={<InlineAlbum album={album} size='normal' />}
                    second={DateFormatter.toMinuteHourDayMonthYear(
                      new Date(info.played_at),
                    )}
                  />
                );
              })}
            </TitleCard>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
