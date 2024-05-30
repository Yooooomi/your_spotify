import { PureComponent, useCallback, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Tooltip as MuiTooltip } from "@mui/material";
import { Link } from "react-router-dom";
import { api, DEFAULT_ITEMS_TO_LOAD } from "../../../services/apis/api";
import { useAPI, useResizeDebounce } from "../../../services/hooks/hooks";
import Bar from "../../charts/Bar";
import { ImplementedChartProps } from "../types";
import { Artist } from "../../../services/types";
import ChartCard from "../../ChartCard";
import { getAtLeastImage } from "../../../services/tools";
import LoadingImplementedChart from "../LoadingImplementedChart";
import { selectRawIntervalDetail } from "../../../services/redux/modules/user/selector";
import Tooltip from "../../Tooltip";
import { TitleFormatter, ValueFormatter } from "../../Tooltip/Tooltip";

interface BestArtistsBarProps extends ImplementedChartProps {}

const tooltipTitle: TitleFormatter<unknown[]> = ({ x }) => `Rank ${x + 1}`;

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
        <MuiTooltip title={artist.name}>
          <g transform={`translate(${x - svgImgSize / 2},${y})`}>
            <clipPath id="yoyo">
              <circle
                r={svgImgSize / 2}
                cx={svgImgSize / 2}
                cy={svgImgSize / 2}
              />
            </clipPath>
            <image
              width={svgImgSize}
              height={svgImgSize}
              href={getAtLeastImage(artist.images, svgImgSize)}
              clipPath="url(#yoyo)"
            />
          </g>
        </MuiTooltip>
      </Link>
    );
  }
}

export default function BestArtistsBar({ className }: BestArtistsBarProps) {
  const { interval } = useSelector(selectRawIntervalDetail);
  const ref = useRef<HTMLDivElement>(null);
  const [displayNb, setDisplayNb] = useState(10);
  const result = useAPI(
    api.getBestArtists,
    interval.start,
    interval.end,
    DEFAULT_ITEMS_TO_LOAD,
    0,
  );

  const compute = useCallback((width: number) => {
    setDisplayNb(Math.floor((width || 500) / 50));
  }, []);

  useResizeDebounce(compute, ref);

  const data = useMemo(
    () =>
      result?.slice(0, displayNb).map((r, k) => ({
        x: k,
        y: r.count,
      })) ?? [],
    [displayNb, result],
  );

  const tooltipValue = useCallback<ValueFormatter<typeof data>>(
    payload => {
      const dataValue = result?.[payload.x];
      if (!dataValue) {
        return "";
      }
      return `You listened to ${dataValue.artist.name} ${dataValue.count} times`;
    },
    [result],
  );

  if (!result) {
    return (
      <LoadingImplementedChart title="Best artists" className={className} />
    );
  }

  return (
    <ChartCard ref={ref} title="Best artists" className={className}>
      <Bar
        data={data}
        customTooltip={<Tooltip title={tooltipTitle} value={tooltipValue} />}
        // @ts-ignore
        customXTick={<ImageAxisTick artists={result.map(r => r.artist)} />}
      />
    </ChartCard>
  );
}
