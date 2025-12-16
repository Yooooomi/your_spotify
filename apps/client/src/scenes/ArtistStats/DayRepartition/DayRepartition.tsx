import ChartCard from "../../../components/ChartCard";
import Bar from "../../../components/charts/Bar";
import Tooltip from "../../../components/Tooltip";


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
  const total = stats.reduce((acc, curr) => acc + curr.count, 0);
  const totalDuration = stats.reduce((acc, curr) => acc + curr.duration, 0);
  const data = Array.from(Array(24).keys()).map(idx => {
        const stat = stats.find(st => st._id === idx);

        return {
          x: idx,
          y: stat ? Math.floor((stat.count / total) * 1000) / 10 : 0,
          count: stat?.count ?? 0,
          duration: stat?.duration ?? 0,
        };
      });

  const tooltipTitle = ({ x }) => `${x}h`;
  const tooltipValue = (payload, value) => (
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
