import { useSelector } from "react-redux";
import { api } from "../../../services/apis/api";
import { useAPI } from "../../../services/hooks/hooks";
import { selectRawIntervalDetail } from "../../../services/redux/modules/user/selector";
import {
  buildXYData,
  formatXAxisDateTooltip,
  useFormatXAxis,
} from "../../../services/stats";
import { DateId } from "../../../services/types";
import ChartCard from "../../ChartCard";
import Line from "../../charts/Line";
import Tooltip from "../../Tooltip";
import LoadingImplementedChart from "../LoadingImplementedChart";
import { ImplementedChartProps } from "../types";

interface SongsListenedPerProps extends ImplementedChartProps { }

export default function SongsListenedPer({ className }: SongsListenedPerProps) {
  const { interval } = useSelector(selectRawIntervalDetail);
  const result = useAPI(
    api.songsPer,
    interval.start,
    interval.end,
    interval.timesplit,
  );

  const data = buildXYData(
    result?.map(r => ({
      _id: r._id as DateId,
      value: r.count,
    })) ?? [],
    interval.start,
    interval.end,
  );

  const formatX = useFormatXAxis(data);
  const tooltipValue = (_, value) => `${value} songs`;

  if (!result) {
    return (
      <LoadingImplementedChart title="Songs listened" className={className} />
    );
  }

  if (result.length > 0 && result[0]?._id == null) {
    return null;
  }

  return (
    <ChartCard title="Songs listened" className={className}>
      <Line
        data={data}
        xFormat={formatX}
        customTooltip={
          <Tooltip title={formatXAxisDateTooltip} value={tooltipValue} />
        }
      />
    </ChartCard>
  );
}
