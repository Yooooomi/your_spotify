import { useMemo, useCallback } from "react";
import ChartCard from "../../../components/ChartCard";
import Bar from "../../../components/charts/Bar";
import Tooltip from "../../../components/Tooltip";
import {
  TitleFormatter,
  ValueFormatter,
} from "../../../components/Tooltip/Tooltip";
import { ArtistStatsResponse } from "../../../services/apis/api";
import { msToMinutes } from "../../../services/stats";

interface DayRepartitionProps {
  stats: ArtistStatsResponse["dayRepartition"];
  className?: string;
}

export default function DayRepartition({
  stats,
  className,
}: DayRepartitionProps) {
  const total = useMemo(
    () => stats.reduce((acc, curr) => acc + curr.count, 0),
    [stats],
  );
  const totalDuration = useMemo(
    () => stats.reduce((acc, curr) => acc + curr.duration, 0),
    [stats],
  );
  const data = useMemo(
    () =>
      Array.from(Array(24).keys()).map(idx => {
        const stat = stats.find(st => st._id === idx);

        return {
          x: idx,
          y: stat ? Math.floor((stat.count / total) * 1000) / 10 : 0,
          count: stat?.count ?? 0,
          duration: stat?.duration ?? 0,
        };
      }),
    [stats, total],
  );

  const tooltipTitle = useCallback<TitleFormatter<typeof data>>(
    ({ x }) => `${x}h`,
    [],
  );
  const tooltipValue = useCallback<ValueFormatter<typeof data>>(
    (payload, value) => (
      <div>
        {`${value}% of your listening`}
        <br />
        {`${payload.count} out of ${total} songs`}
        <br />
        {`${msToMinutes(payload.duration ?? 0)} out of ${msToMinutes(
          totalDuration,
        )} minutes`}
        <br />
      </div>
    ),
    [total, totalDuration],
  );

  return (
    <ChartCard title="Day repartition of your listening" className={className}>
      <Bar
        data={data}
        customTooltip={
          <Tooltip<typeof data> title={tooltipTitle} value={tooltipValue} />
        }
      />
    </ChartCard>
  );
}
