import { useSelector } from "react-redux";
import { api } from "../../../services/apis/api";
import { useAPI } from "../../../services/hooks/hooks";
import Bar from "../../charts/Bar";
import { ImplementedChartProps } from "../types";
import ChartCard from "../../ChartCard";
import LoadingImplementedChart from "../LoadingImplementedChart";
import {
  selectRawIntervalDetail,
  selectStatMeasurement,
} from "../../../services/redux/modules/user/selector";
import Tooltip from "../../Tooltip";
import { TitleFormatter } from "../../Tooltip/Tooltip";
import { DateFormatter } from "../../../services/date";
import { msToMinutes } from "../../../services/stats";

interface ListeningRepartitionProps extends ImplementedChartProps {}

const formatYAxis = (value: any) => `${value}%`;

const tooltipTitle: TitleFormatter<unknown[]> = ({ x }) =>
  DateFormatter.fromNumberToHour(x);

export default function ListeningRepartition({
  className,
}: ListeningRepartitionProps) {
  const measurement = useSelector(selectStatMeasurement);
  const { interval } = useSelector(selectRawIntervalDetail);
  const result = useAPI(api.timePerHourOfDay, interval.start, interval.end);

  const total = result?.reduce((acc, curr) => acc + curr.count, 0) ?? 0;
  const data = Array.from(Array(24).keys()).map(i => {
        const dataValue = result?.find(r => r._id === i);
        if (!dataValue) {
          return {
            x: i,
            y: 0,
            count: 0,
          };
        }
        return {
          x: i,
          y: Math.floor((dataValue.count / total) * 1000) / 10,
          count: dataValue.count,
        };
      });

  const tooltipValue = (payload: any, value: any) => {
      if (measurement === "number") {
        return (
          <div>
            {`${value}% of your daily listening`}
            <br />
            {`${payload.count} out of ${total} songs`}
          </div>
        );
      }
      return (
        <div>
          {`${value}% of your daily listening`}
          <br />
          {`${msToMinutes(payload.count)} out of ${msToMinutes(total)} minutes`}
        </div>
      );
    };

  if (!result) {
    return (
      <LoadingImplementedChart
        className={className}
        title="Listening distribution over day"
      />
    );
  }

  return (
    <ChartCard className={className} title="Listening distribution over day">
      <Bar
        data={data}
        xFormat={DateFormatter.fromNumberToHour}
        yFormat={formatYAxis}
        customTooltip={<Tooltip title={tooltipTitle} value={tooltipValue} />}
      />
    </ChartCard>
  );
}
