import { Fragment, useMemo } from 'react';
import clsx from 'clsx';
import {
  dateToListenedAt,
  msToMinutesAndSeconds,
} from '../../../services/stats';
import { Album, Artist, Track as TrackType } from '../../../services/types';
import s from './index.module.css';
import InlineArtist from '../../InlineArtist';
import Text from '../../Text';
import TrackOptions from '../../TrackOptions';
import InlineTrack from '../../InlineTrack';
import { ColumnDescription, GridRowWrapper } from '../../Grid';
import PlayButton from '../../PlayButton';
import { useMobile } from '../../../services/hooks/hooks';
import { trackGrid } from './TrackGrid';
import LongClickableTrack from '../../LongClickableTrack';

interface TrackProps {
  listenedAt?: Date;
  track: TrackType;
  artists: Artist[];
  album: Album;
}

export default function Track({
  track,
  album,
  artists,
  listenedAt,
}: TrackProps) {
  const [isMobile, isTablet] = useMobile();

  const columns = useMemo<ColumnDescription[]>(
    () => [
      {
        ...trackGrid.cover,
        node: <PlayButton id={track.id} covers={album.images} />,
      },
      {
        ...trackGrid.title,
        node: (
          <div className={s.names}>
            <Text element="div">
              <InlineTrack track={track} />
            </Text>
            <Text element="div" className={s.artistname}>
              {artists.map((art, k, a) => (
                <Fragment key={art.id}>
                  <InlineArtist artist={art} noStyle />
                  {k !== a.length - 1 && ', '}
                </Fragment>
              ))}
            </Text>
          </div>
        ),
      },
      {
        ...trackGrid.album,
        node: !isTablet && <Text className={clsx(s.names)}>{album.name}</Text>,
      },
      {
        ...trackGrid.duration,
        node: !isMobile && (
          <Text>{msToMinutesAndSeconds(track.duration_ms)}</Text>
        ),
      },
      {
        ...trackGrid.listened,
        node: listenedAt && !isMobile && (
          <Text>{dateToListenedAt(listenedAt)}</Text>
        ),
      },
      {
        ...trackGrid.option,
        node: !isMobile && <TrackOptions track={track} />,
      },
    ],
    [album.images, album.name, artists, isMobile, isTablet, listenedAt, track],
  );

  return (
    <LongClickableTrack track={track}>
      <GridRowWrapper
        className={clsx('play-button-holder', s.row)}
        columns={columns}
      />
    </LongClickableTrack>
  );
}
