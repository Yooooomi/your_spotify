import React from 'react';
import { CircularProgress, Grid } from '@mui/material';
import Header from '../../components/Header';
import TitleCard from '../../components/TitleCard';
import { TrackStatsResponse } from '../../services/apis/api';
import {
  buildFromDateId,
  dateToMonthAndYear,
  formatDateTime,
} from '../../services/stats';
import { getAtLeastImage } from '../../services/tools';
import s from './index.module.css';
import Text from '../../components/Text';
import InlineArtist from '../../components/InlineArtist';
import TrackRank from './TrackRank/TrackRank';
import FirstAndLast from './FirstAndLast';
import ImageTwoLines from '../../components/ImageTwoLines';

interface TrackStatsProps {
  trackId: string;
  stats: TrackStatsResponse;
}

export default function TrackStats({ trackId, stats }: TrackStatsProps) {
  if (!stats) {
    return <CircularProgress />;
  }

  return (
    <div>
      <Header
        left={
          <img
            className={s.headerimage}
            src={getAtLeastImage(stats.album.images, 60)}
            alt="Album"
          />
        }
        title={stats.track.name}
        subtitle={<InlineArtist artist={stats.artist} />}
        hideInterval
      />
      <div className={s.content}>
        <div className={s.header}>
          <div className={s.ranks}>
            <TrackRank trackId={trackId} />
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
              <TitleCard title="Context" contentClassName={s.context}>
                <ImageTwoLines
                  image={getAtLeastImage(stats.artist.images, 48)}
                  first={<InlineArtist artist={stats.artist} />}
                  second="Artist"
                />
                <ImageTwoLines
                  image={getAtLeastImage(stats.album.images, 48)}
                  first={stats.album.name}
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
          </Grid>
          <Grid item xs={6}>
            <TitleCard title="Recently played on">
              {stats.recentHistory.map(info => (
                <ImageTwoLines
                  key={info.id}
                  image={getAtLeastImage(stats.album.images, 48)}
                  first={stats.track.name}
                  second={formatDateTime(new Date(info.played_at))}
                />
              ))}
            </TitleCard>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
