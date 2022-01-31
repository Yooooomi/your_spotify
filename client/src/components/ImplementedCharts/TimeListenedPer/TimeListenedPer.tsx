import React, { useCallback } from "react";
import { api } from "../../../services/api";
import { useAPI } from "../../../services/hooks";
import {
  buildXYData,
  formatDateToString,
  useFormatXAxis,
} from "../../../services/stats";
import { DateId } from "../../../services/types";
import Line from "../../charts/Line";
import ChartCard from "../../ChartCard";
import LoadingImplementedChart from "../LoadingImplementedChart";
import { ImplementedChartProps } from "../types";

interface TimeListenedPerProps extends ImplementedChartProps {}

export default function TimeListenedPer({
  className,
  interval,
}: TimeListenedPerProps) {
  const result = useAPI(
    api.timePer,
    interval.start,
    interval.end,
    interval.timesplit
  );

  const data = buildXYData(
    result?.map((r) => ({
      _id: r._id as DateId,
      value: r.count,
    })) ?? [],
    interval.start,
    interval.end
  );

  const formatX = useFormatXAxis(data, interval.start, interval.end);
  const formatY = useCallback((value: number, index: number) => {
    return `${Math.floor(value / 1000 / 60)}m`;
  }, []);
  const formatXTooltip = useCallback(
    (value: string, payload: typeof data[number]) => {
      return formatDateToString(payload.date);
    },
    []
  );
  const formatYTooltip = useCallback(
    (value: number, payload: typeof data[number]) => {
      return `${Math.floor(value / 1000 / 60)} minutes listened`;
    },
    []
  );

  if (!result) {
    return <LoadingImplementedChart />;
  }

  if (result.length > 0 && result[0]._id == null) {
    return null;
  }

  return (
    <ChartCard title="Time listened" className={className}>
      <Line
        data={data}
        xFormat={formatX}
        yFormat={formatY}
        tooltipLabelFormatter={formatXTooltip}
        tooltipValueFormatter={formatYTooltip}
      />
    </ChartCard>
  );
}
