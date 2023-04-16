import { CircularProgress, Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import Header from '../../components/Header';
import TitleCard from '../../components/TitleCard';
import { ArtistStatsResponse } from '../../services/apis/api';
import { buildFromDateId, dateToMonthAndYear } from '../../services/stats';
import s from './index.module.css';
import DayRepartition from './DayRepartition';
import Text from '../../components/Text';
import ArtistRank from './ArtistRank/ArtistRank';
import InlineTrack from '../../components/InlineTrack';
import FirstAndLast from './FirstAndLast';
import ArtistContextMenu from './ArtistContextMenu';
import { selectBlacklistedArtist } from '../../services/redux/modules/user/selector';
import IdealImage from '../../components/IdealImage';
import ImageTwoLines from '../../components/ImageTwoLines';

interface ArtistStatsProps {
  artistId: string;
  stats: ArtistStatsResponse;
}

export default function ArtistStats({ artistId, stats }: ArtistStatsProps) {
  const blacklisted = useSelector(selectBlacklistedArtist(artistId));

  if (!stats) {
    return <CircularProgress />;
  }

  return (
    <div>
      <Header
        left={
          <IdealImage
            className={s.headerimage}
            images={stats.artist.images}
            size={60}
            alt="Artist"
          />
        }
        right={
          <ArtistContextMenu
            artistId={stats.artist.id}
            artistName={stats.artist.name}
            blacklisted={blacklisted}
          />
        }
        title={stats.artist.name}
        subtitle={stats.artist.genres.join(', ')}
        hideInterval
      />
      <div className={s.content}>
        <div className={s.header}>
          <ArtistRank artistId={artistId} />
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
            spacing={2}
            justifyContent="flex-start"
            alignItems="flex-start">
            <Grid item xs={12}>
              <TitleCard title="Songs listened">
                <Text element="strong" className={s.songslistened}>
                  {stats.total.count}
                </Text>
              </TitleCard>
            </Grid>
            <Grid item xs={12}>
              <FirstAndLast
                firstImages={stats.firstLast.first.track.album.images}
                lastImages={stats.firstLast.last.track.album.images}
                firstDate={new Date(stats.firstLast.first.played_at)}
                lastDate={new Date(stats.firstLast.last.played_at)}
                firstElement={
                  <InlineTrack track={stats.firstLast.first.track} />
                }
                lastElement={<InlineTrack track={stats.firstLast.last.track} />}
              />
            </Grid>
            <Grid item xs={12}>
              <TitleCard
                title={`Top two months you listened to ${stats.artist.name}`}>
                <div className={s.bestperiod}>
                  <Text element="strong">
                    {dateToMonthAndYear(
                      buildFromDateId(stats.bestPeriod[0]._id),
                    )}
                  </Text>
                  <Text>
                    {stats.bestPeriod[0].count} times (
                    {Math.floor(
                      (stats.bestPeriod[0].count / stats.bestPeriod[0].total) *
                        100,
                    )}
                    % of total time)
                  </Text>
                </div>
                {stats.bestPeriod.length > 1 && (
                  <div className={s.bestperiod}>
                    <Text element="strong">
                      {dateToMonthAndYear(
                        buildFromDateId(stats.bestPeriod[1]._id),
                      )}
                    </Text>
                    <Text>
                      {stats.bestPeriod[1].count} times (
                      {Math.floor(
                        (stats.bestPeriod[1].count /
                          stats.bestPeriod[1].total) *
                          100,
                      )}
                      % of total time)
                    </Text>
                  </div>
                )}
              </TitleCard>
            </Grid>
            <Grid item xs={12}>
              <DayRepartition
                stats={stats.dayRepartition}
                className={s.chart}
              />
            </Grid>
          </Grid>
          <Grid item xs={12} lg={6}>
            <TitleCard title="Most listened tracks">
              {stats.mostListened.map((ml, k) => (
                <div key={ml.track.id} className={s.ml}>
                  <Text element="strong" className={s.mlrank}>
                    #{k + 1}
                  </Text>
                  <ImageTwoLines
                    image={
                      <IdealImage
                        className={s.cardimg}
                        images={ml.track.album.images}
                        size={48}
                        alt="album cover"
                      />
                    }
                    first={<InlineTrack track={ml.track} />}
                    second={`${ml.count} times`}
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
