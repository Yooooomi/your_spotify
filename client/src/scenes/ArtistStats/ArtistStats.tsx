import React, { useCallback, useEffect, useState } from 'react';
import { CircularProgress, Grid } from '@mui/material';
import clsx from 'clsx';
import Header from '../../components/Header';
import InlineArtist from '../../components/InlineArtist';
import TitleCard from '../../components/TitleCard';
import { api, ArtistStatsResponse } from '../../services/api';
import { buildFromDateId, dateToListenedAt, dateToMonthAndYear } from '../../services/stats';
import { getImage } from '../../services/tools';
import { Artist } from '../../services/types';
import s from './index.module.css';
import DayRepartition from './DayRepartition';

interface ArtistStatsProps {
  stats: ArtistStatsResponse;
}

export default function ArtistStats({ stats }: ArtistStatsProps) {
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    async function fetchArtists() {
      const ids = stats?.rank.results.map((r) => r.id) ?? [];
      if (!ids.every((id) => artists.some((a) => a.id === id))) {
        try {
          const { data } = await api.getArtists(ids);
          setArtists(data);
        } catch (e) {
          console.error(e);
        }
      }
    }
    fetchArtists();
  }, [artists, stats]);

  const getArtist = useCallback((id: string) => artists.find((a) => a.id === id), [artists]);

  if (!stats) {
    return <CircularProgress />;
  }

  const ids = stats?.rank.results.map((r) => r.id) ?? [];
  if (!ids.every((id) => artists.some((a) => a.id === id))) {
    return <CircularProgress />;
  }

  return (
    <div>
      <Header
        left={<img className={s.headerimage} src={getImage(stats.artist)} alt="Artist" />}
        title={stats.artist.name}
        subtitle={`All the stats about ${stats.artist.name}`}
      />
      <div className={s.content}>
        <div className={s.header}>
          <h1>Rank #{stats.rank.index + 1}</h1>
          <div>
            <div className={s.ranks}>
              {stats.rank.results.map((rank, k, a) => (
                <div
                  className={clsx({
                    [s.rank]: true,
                    [s.before]:
                      !stats.rank.isMax &&
                      ((stats.rank.isMin && k < 2) || (!stats.rank.isMin && k === 0)),
                    [s.after]:
                      !stats.rank.isMin &&
                      ((stats.rank.isMax && k > 0) || (!stats.rank.isMax && k === 2)),
                    [s.actual]:
                      (stats.rank.isMax && k === 0) ||
                      (stats.rank.isMin && k === a.length - 1) ||
                      (!stats.rank.isMax && !stats.rank.isMin && k === 1),
                  })}>
                  #{stats.rank.index + k + (stats.rank.isMax ? 1 : 0) + (stats.rank.isMin ? -1 : 0)}{' '}
                  <InlineArtist artist={getArtist(rank.id)!} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <Grid container justifyContent="flex-start" alignItems="flex-start" spacing={2}>
          <Grid
            container
            item
            xs={6}
            justifyContent="flex-start"
            alignItems="flex-start"
            spacing={2}>
            <Grid item xs={12}>
              <TitleCard title="Songs listened">
                <strong className={s.songslistened}>{stats.total.count}</strong>
              </TitleCard>
            </Grid>
            <Grid item xs={12}>
              <TitleCard title="First and last time listened">
                <div key={stats.firstLast.last.id} className={s.ml}>
                  <img
                    className={s.cardimg}
                    src={getImage(stats.firstLast.last.track.album)}
                    alt="album cover"
                  />
                  <div className={s.mlstat}>
                    <strong>{stats.firstLast.last.track.name}</strong>
                    <span>
                      Last listened on {dateToListenedAt(new Date(stats.firstLast.last.played_at))}
                    </span>
                  </div>
                </div>
                <div key={stats.firstLast.first.id} className={s.ml}>
                  <img
                    className={s.cardimg}
                    src={getImage(stats.firstLast.first.track.album)}
                    alt="album cover"
                  />
                  <div className={s.mlstat}>
                    <strong>{stats.firstLast.first.track.name}</strong>
                    <span>
                      First listened on{' '}
                      {dateToListenedAt(new Date(stats.firstLast.first.played_at))}
                    </span>
                  </div>
                </div>
              </TitleCard>
            </Grid>
            <Grid item xs={12}>
              <TitleCard title={`Top two months you listened to ${stats.artist.name}`}>
                <div className={s.bestperiod}>
                  <strong>{dateToMonthAndYear(buildFromDateId(stats.bestPeriod[0]._id))}</strong>
                  <span>
                    {stats.bestPeriod[0].count} times (
                    {Math.floor((stats.bestPeriod[0].count / stats.bestPeriod[0].total) * 100)}% of
                    total time)
                  </span>
                </div>
                {stats.bestPeriod.length > 1 && (
                  <div className={s.bestperiod}>
                    <strong>{dateToMonthAndYear(buildFromDateId(stats.bestPeriod[1]._id))}</strong>
                    <span>
                      {stats.bestPeriod[1].count} times (
                      {Math.floor((stats.bestPeriod[1].count / stats.bestPeriod[1].total) * 100)}%
                      of total time)
                    </span>
                  </div>
                )}
              </TitleCard>
            </Grid>
            <Grid item xs={12}>
              <DayRepartition stats={stats.dayRepartition} className={s.chart} />
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <TitleCard title="Most listened tracks">
              {stats.mostListened.map((ml, k) => (
                <div key={ml.track.id} className={s.ml}>
                  <strong className={s.mlrank}>#{k + 1}</strong>
                  <img className={s.cardimg} src={getImage(ml.track.album)} alt="album cover" />
                  <div className={s.mlstat}>
                    <strong>{ml.track.name}</strong>
                    <span>{ml.count} times</span>
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
