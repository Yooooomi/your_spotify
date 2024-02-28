import {
  LineChart,
  Line as RLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { ContentType } from "recharts/types/component/Tooltip";
import { DateWithPrecision } from "../../../services/stats";

interface LineProps<
  D extends { x: number; y: number; dateWithPrecision: DateWithPrecision },
> {
  data: D[];
  xFormat?: React.ComponentProps<typeof XAxis>["tickFormatter"];
  yFormat?: React.ComponentProps<typeof YAxis>["tickFormatter"];
  customTooltip?: ContentType<any, any>;
}

export default function Line<
  D extends { x: number; y: number; dateWithPrecision: DateWithPrecision },
>({ data, xFormat, yFormat, customTooltip }: LineProps<D>) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <RLine
          connectNulls
          type="monotone"
          dataKey="y"
          fill="var(--primary)"
          stroke="var(--primary)"
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
          wrapperStyle={{ zIndex: 10 }}
          contentStyle={{ backgroundColor: "var(--background)" }}
          labelStyle={{ color: "var(--text-on-light)" }}
          content={customTooltip}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
