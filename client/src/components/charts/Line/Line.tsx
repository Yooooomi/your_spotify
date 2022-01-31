import React, { useCallback } from "react";
import {
  LineChart,
  Line as RLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Payload,
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
interface LineProps<D extends { x: number; y: number }> {
  data: D[];
  xFormat?: React.ComponentProps<typeof XAxis>["tickFormatter"];
  yFormat?: React.ComponentProps<typeof YAxis>["tickFormatter"];
  tooltipLabelFormatter?: (value: string, payload: D) => string;
  tooltipValueFormatter?: (value: number, payload: D) => string;
}

export default function Line<D extends { x: number; y: number }>({
  data,
  xFormat,
  yFormat,
  tooltipLabelFormatter,
  tooltipValueFormatter,
}: LineProps<D>) {
  const internTooltipLabelFormatter = useCallback(
    <T extends NameType, V extends ValueType>(
      label: string,
      payload: Payload<V, T>[]
    ) =>
      tooltipLabelFormatter
        ? payload?.map((p) => tooltipLabelFormatter(label, p.payload))
        : label,
    [tooltipLabelFormatter]
  );

  const internTooltipValueFormatter = useCallback(
    (value: any, b: any, props: any) => {
      if (tooltipValueFormatter) {
        return tooltipValueFormatter(value, props.payload);
      } else {
        return value;
      }
    },
    [tooltipValueFormatter]
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <RLine
          connectNulls
          type="monotone"
          dataKey="y"
          fill="#000000"
          stroke="#000000"
          strokeWidth={2}
          dot={false}
        />
        <XAxis
          name="X"
          domain={["dataMin", "dataMax"]}
          dataKey="x"
          tickFormatter={xFormat}
          style={{ fontWeight: "bold" }}
        />
        <YAxis domain={["dataMin", "dataMax"]} tickFormatter={yFormat} />
        <Tooltip
          labelFormatter={internTooltipLabelFormatter}
          formatter={internTooltipValueFormatter}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
