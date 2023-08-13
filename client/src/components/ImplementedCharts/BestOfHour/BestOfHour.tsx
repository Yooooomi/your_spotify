import { MenuItem, Select } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../../services/apis/api';
import { useAPI } from '../../../services/hooks/hooks';
import { selectRawIntervalDetail } from '../../../services/redux/modules/user/selector';
import { UnboxPromise } from '../../../services/types';
import ChartCard from '../../ChartCard';
import StackedBar from '../../charts/StackedBar';
import { StackedBarProps } from '../../charts/StackedBar/StackedBar';
import Tooltip from '../../Tooltip';
import { TitleFormatter, ValueFormatter } from '../../Tooltip/Tooltip';
import LoadingImplementedChart from '../LoadingImplementedChart';
import { ImplementedChartProps } from '../types';

interface BestOfHourProps extends ImplementedChartProps {}

enum Element {
  ARTIST = 'artists',
  ALBUM = 'albums',
  TRACK = 'tracks',
  GENRE = 'genres',
}

const elementToCall = {
  [Element.ARTIST]: api.getBestArtistsOfHour,
  [Element.ALBUM]: api.getBestAlbumsOfHour,
  [Element.TRACK]: api.getBestSongsOfHour,
  [Element.GENRE]: api.getBestGenresOfHour,
} as const;

function getElementName(
  result: UnboxPromise<
    ReturnType<(typeof elementToCall)[Element]>
  >['data'][number],
  id: string,
) {
  if ('tracks' in result) {
    return result.tracks.find(t => t.track.id === id)?.track.name;
  }
  if ('albums' in result) {
    return result.albums.find(t => t.album.id === id)?.album.name;
  }
  if ('artists' in result) {
    return result.artists.find(t => t.artist.id === id)?.artist.name;
  }
  if ('genres' in result) {
    return result.genres.find(t => t.genre.id === id)?.genre.name;
  }
  return '';
}

function getElementData(
  result: UnboxPromise<ReturnType<(typeof elementToCall)[Element]>>['data'],
  index: number,
) {
  const foundIndex = result.findIndex(r => r._id === index);
  if (foundIndex === -1) {
    return { x: index };
  }
  const found = result[foundIndex];
  const { total } = found;

  if ('tracks' in found) {
    return found.tracks.reduce<StackedBarProps['data'][number]>(
      (acc, curr) => {
        acc[curr.track.id] = Math.floor((curr.count / total) * 1000) / 10;
        return acc;
      },
      { x: index },
    );
  }
  if ('albums' in found) {
    return found.albums.reduce<StackedBarProps['data'][number]>(
      (acc, curr) => {
        acc[curr.album.id] = Math.floor((curr.count / total) * 1000) / 10;
        return acc;
      },
      { x: index },
    );
  }
  if ('artists' in found) {
    return found.artists.reduce<StackedBarProps['data'][number]>(
      (acc, curr) => {
        acc[curr.artist.id] = Math.floor((curr.count / total) * 1000) / 10;
        return acc;
      },
      { x: index },
    );
  }
  if ('genres' in found) {
    return found.genres.reduce<StackedBarProps['data'][number]>(
      (acc, curr) => {
        acc[curr.genre.id] = Math.floor((curr.count / total) * 1000) / 10;
        return acc;
      },
      { x: index },
    );
  }
  return { x: index };
}

function formatX(value: any) {
  return `${value}:00`;
}

export default function BestOfHour({ className }: BestOfHourProps) {
  const { interval } = useSelector(selectRawIntervalDetail);
  const [element, setElement] = useState<Element>(Element.ARTIST);
  const result = useAPI(elementToCall[element], interval.start, interval.end);

  const data = useMemo(() => {
    if (!result) {
      return [];
    }
    return Array.from(Array(24).keys()).map(index =>
      getElementData(result, index),
    );
  }, [result]);

  const tooltipTitle = useCallback<TitleFormatter<typeof data>>(
    ({ x }) => `20 most listened ${element} at ${x}:00`,
    [element],
  );

  const tooltipValue = useCallback<ValueFormatter<typeof data>>(
    (payload, value, root) => {
      const foundIndex = result?.findIndex(r => r._id === payload.x);
      if (result && foundIndex !== undefined && foundIndex !== -1) {
        const found = result[foundIndex];
        return (
          <span style={{ color: root.color }}>
            {value}% of {getElementName(found, root.dataKey.toString())}
          </span>
        );
      }
    },
    [result],
  );

  if (!result) {
    return (
      <LoadingImplementedChart
        title={`Best ${element} for hour of day`}
        className={className}
      />
    );
  }

  return (
    <ChartCard
      title={`Best ${element} for hour of day`}
      right={
        <Select
          value={element}
          onChange={ev => setElement(ev.target.value as Element)}
          variant="standard">
          {Object.values(Element).map(elem => (
            <MenuItem key={elem} value={elem}>
              {elem}
            </MenuItem>
          ))}
        </Select>
      }
      className={className}>
      <StackedBar
        data={data}
        xFormat={formatX}
        customTooltip={<Tooltip title={tooltipTitle} value={tooltipValue} />}
      />
    </ChartCard>
  );
}
