import React, { PureComponent, useCallback, useMemo } from 'react';
import { Tooltip } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { useAPI } from '../../../services/hooks';
import Bar from '../../charts/Bar';
import { ImplementedChartProps } from '../types';
import { Artist } from '../../../services/types';
import ChartCard from '../../ChartCard';
import { getImage } from '../../../services/tools';

interface BestArtistsBarProps extends ImplementedChartProps {}

const formatXTooltip = (label: string) => {
  return `Rank ${label + 1}`;
};

const svgImgSize = 32;
class ImageAxisTick extends PureComponent<{
  x: number;
  y: number;
  payload: {
    index: number;
  };
  artists: Artist[];
}> {
  render() {
    const { x, y, payload, artists } = this.props;

    const artist = artists[payload.index];

    if (!artist) {
      return null;
    }

    return (
      <Link to={`/artist/${artist.id}`}>
        <Tooltip title={artist.name}>
          <g transform={`translate(${x - svgImgSize / 2},${y})`}>
            <clipPath id="yoyo">
              <circle r={svgImgSize / 2} cx={svgImgSize / 2} cy={svgImgSize / 2} />
            </clipPath>
            <image
              width={svgImgSize}
              height={svgImgSize}
              href={getImage(artist)}
              clipPath="url(#yoyo)"
            />
          </g>
        </Tooltip>
      </Link>
    );
  }
}

export default function BestArtistsBar({ className, interval }: BestArtistsBarProps) {
  const result = useAPI(api.getBestArtists, interval.start, interval.end, 10, 0);

  const data = useMemo(
    () =>
      result?.map((r, k) => ({
        x: k,
        y: r.count,
        artist: r.artist,
      })) ?? [],
    [result],
  );

  const formatYTooltip = useCallback(
    (a: any, b: any, c: any) => {
      const dataValue = result?.[c.payload.x];
      if (!dataValue) {
        return '';
      }
      return `You listened to ${dataValue.artist.name} ${dataValue.count} times`;
    },
    [result],
  );

  if (!result) {
    return null;
  }

  return (
    <ChartCard title="Best artists" className={className}>
      <Bar
        data={data}
        tooltipLabelFormatter={formatXTooltip}
        tooltipValueFormatter={formatYTooltip}
        // @ts-ignore
        customXTick={<ImageAxisTick artists={result.map((r) => r.artist)} />}
      />
    </ChartCard>
  );
}
