import { CircularProgress, Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import Header from '../../components/Header';
import TitleCard from '../../components/TitleCard';
import { ArtistStatsResponse } from '../../services/apis/api';
import {
  buildFromDateId,
  dateToListenedAt,
  dateToMonthAndYear,
} from '../../services/stats';
import { getAtLeastImage } from '../../services/tools';
import s from './index.module.css';
import DayRepartition from './DayRepartition';
import Text from '../../components/Text';
import ArtistRank from './ArtistRank/ArtistRank';
import ArtistContextMenu from './ArtistContextMenu';
import { selectBlacklistedArtist } from '../../services/redux/modules/user/selector';

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
          <img
            className={s.headerimage}
            src={getAtLeastImage(stats.artist.images, 60)}
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
          <div className={s.ranks}>
            <ArtistRank artistId={artistId} />
          </div>
        </div>
        <Grid
          container
          justifyContent="flex-start"
          alignItems="flex-start"
          spacing={2}>
          <Grid
            container
            item
            xs={12}
            lg={6}
            justifyContent="flex-start"
            alignItems="flex-start"
            spacing={2}>
            <Grid item xs={12}>
              <TitleCard title="Songs listened">
                <Text element="strong" className={s.songslistened}>
                  {stats.total.count}
                </Text>
              </TitleCard>
            </Grid>
            <Grid item xs={12}>
              <TitleCard title="First and last time listened">
                <div key={stats.firstLast.last.id} className={s.ml}>
                  <img
                    className={s.cardimg}
                    src={getAtLeastImage(
                      stats.firstLast.last.track.album.images,
                      48,
                    )}
                    alt="album cover"
                  />
                  <div className={s.mlstat}>
                    <Text element="strong">
                      {stats.firstLast.last.track.name}
                    </Text>
                    <Text>
                      Last listened on{' '}
                      {dateToListenedAt(
                        new Date(stats.firstLast.last.played_at),
                      )}
                    </Text>
                  </div>
                </div>
                <div key={stats.firstLast.first.id} className={s.ml}>
                  <img
                    className={s.cardimg}
                    src={getAtLeastImage(
                      stats.firstLast.first.track.album.images,
                      48,
                    )}
                    alt="album cover"
                  />
                  <div className={s.mlstat}>
                    <Text element="strong">
                      {stats.firstLast.first.track.name}
                    </Text>
                    <Text>
                      First listened on{' '}
                      {dateToListenedAt(
                        new Date(stats.firstLast.first.played_at),
                      )}
                    </Text>
                  </div>
                </div>
              </TitleCard>
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
          <Grid item xs={6}>
            <TitleCard title="Most listened tracks">
              {stats.mostListened.map((ml, k) => (
                <div key={ml.track.id} className={s.ml}>
                  <Text element="strong" className={s.mlrank}>
                    #{k + 1}
                  </Text>
                  <img
                    className={s.cardimg}
                    src={getAtLeastImage(ml.track.album.images, 48)}
                    alt="album cover"
                  />
                  <div className={s.mlstat}>
                    <Text element="strong">{ml.track.name}</Text>
                    <Text>{ml.count} times</Text>
                  </div>
                </div>
              ))}
            </TitleCard>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
