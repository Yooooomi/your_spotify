import { CircularProgress, Grid } from "@mui/material";
import { TimelapseOutlined } from "@mui/icons-material";
import Header from "../../components/Header";
import { AlbumStatsResponse } from "../../services/apis/api";
import InlineArtist from "../../components/InlineArtist";
import IdealImage from "../../components/IdealImage";
import FirstAndLast from "../ArtistStats/FirstAndLast";
import InlineTrack from "../../components/InlineTrack";
import TitleCard from "../../components/TitleCard";
import Text from "../../components/Text";
import ImageTwoLines from "../../components/ImageTwoLines";
import { msToMinutesAndSeconds } from "../../services/stats";
import s from "./index.module.css";
import AlbumRank from "./AlbumRank";

interface AlbumStatsProps {
  stats: AlbumStatsResponse;
}

export default function AlbumStats({ stats }: AlbumStatsProps) {
  if (!stats) {
    return <CircularProgress />;
  }

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
        title={stats.album.name}
        subtitle={stats.artists.map((artist, k) => (
          <>
            <InlineArtist artist={artist} key={artist.id} />
            {k < stats.artists.length - 1 && ", "}
          </>
        ))}
        hideInterval
      />
      <div className={s.content}>
        <div className={s.header}>
          <AlbumRank albumId={stats.album.id} />
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
                {stats.artists.map(artist => (
                  <ImageTwoLines
                    key={artist.id}
                    image={<IdealImage images={artist.images} size={48} />}
                    first={<InlineArtist artist={artist} />}
                    second="Artist"
                  />
                ))}
                <ImageTwoLines
                  image={<TimelapseOutlined color="primary" fontSize="large" />}
                  first={`${msToMinutesAndSeconds(
                    stats.tracks.reduce(
                      (acc, { track }) => track.duration_ms + acc,
                      0,
                    ),
                  )} (${stats.tracks.length} tracks)`}
                  second="Total duration"
                />
              </TitleCard>
            </Grid>
            <Grid item xs={12}>
              <FirstAndLast
                firstImages={stats.album.images}
                lastImages={stats.album.images}
                firstDate={new Date(stats.firstLast.first.played_at)}
                lastDate={new Date(stats.firstLast.last.played_at)}
                firstElement={
                  <InlineTrack track={stats.firstLast.first.track} />
                }
                lastElement={<InlineTrack track={stats.firstLast.last.track} />}
              />
            </Grid>
          </Grid>
          <Grid item xs={12} lg={6}>
            <TitleCard title="Most listened tracks">
              {stats.tracks.map(({ track, count }, k) => (
                <div key={track.id} className={s.ml}>
                  <Text element="strong" className={s.mlrank}>
                    #{k + 1}
                  </Text>
                  <ImageTwoLines
                    image={
                      <IdealImage
                        className={s.cardimg}
                        images={stats.album.images}
                        size={48}
                        alt="album cover"
                      />
                    }
                    first={<InlineTrack track={track} />}
                    second={`${count} times`}
                  />
                </div>
              ))}
            </TitleCard>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
