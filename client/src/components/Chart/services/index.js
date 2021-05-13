import React, { PureComponent } from 'react';
import { Tooltip } from '@material-ui/core';
import { formatDate } from '../../../services/date';

export const padDate = (value) => (`${value}`).padStart(2, '0');

export const getPrecisionIndex = (start, end) => {
  const diff = end.getTime() - start.getTime();
  const day = 1000 * 60 * 60 * 24;

  if (diff < day * 2) return 0;
  if (diff <= day * 31 * 2) return 1;
  if (diff <= day * 31 * 12 * 2) return 2;
  return 3;
};

const precisions = [
  'hour',
  'day',
  'month',
  'year',
];

export const getPrecision = (start, end) => precisions[getPrecisionIndex(start, end)];

export const getFormatter = (arrayLength, start, end) => {
  const diff = end.getTime() - start.getTime();
  const precision = getPrecision(start, end);

  return value => {
    const ratio = value / (arrayLength - 1);
    const current = new Date(start.getTime() + diff * ratio);

    if (precision === 'hour') return `${padDate(current.getHours())}h`;
    if (precision === 'day') return `${padDate(current.getDate())}/${padDate(current.getMonth() + 1)}`;
    if (precision === 'month') return `${padDate(current.getMonth() + 1)}/${current.getFullYear()}`;
    if (precision === 'year') return `${current.getFullYear()}`;
    return 'NO PRECISION';
  };
};

export const getTooltipFormatter = (data, valueFormat, precision) => (value, name, props) => {
  const finalValue = valueFormat ? valueFormat(value) : Math.round(value * 10) / 10;
  return [finalValue, formatDate(props.payload.date, precision === 0)];
};

export const svgImgSize = 32;
export class ImageAxisTick extends PureComponent {
  render() {
    const {
      x, y, xFormat, payload,
    } = this.props;

    const { name, url } = xFormat ? xFormat(payload.value, payload.name, this.props) : payload.value;

    return (
      <Tooltip title={name}>
        <g transform={`translate(${x - svgImgSize / 2},${y})`}>
          <clipPath id="yoyo">
            <circle r={svgImgSize / 2} cx={svgImgSize / 2} cy={svgImgSize / 2} />
          </clipPath>
          <image width={svgImgSize} height={svgImgSize} href={url} clipPath="url(#yoyo)" />
        </g>
      </Tooltip>
    );
  }
}
