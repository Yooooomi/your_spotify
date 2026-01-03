import {
  BarChart,
  XAxis,
  Bar as RBar,
  Tooltip,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { ContentType } from "recharts/types/component/Tooltip";

interface BarProps {
  data: {
    x: number | string;
    y: number;
  }[];
  customXTick?: React.ComponentProps<typeof XAxis>["tick"];
  xFormat?: React.ComponentProps<typeof XAxis>["tickFormatter"];
  yFormat?: React.ComponentProps<typeof YAxis>["tickFormatter"];
  customTooltip?: ContentType<any, any>;
}

export default function Bar({
  data,
  xFormat,
  yFormat,
  customXTick,
  customTooltip,
}: BarProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis
          dataKey="x"
          tickFormatter={xFormat}
          tick={customXTick}
          style={{ fontWeight: "bold" }}
        />
        <YAxis dataKey="y" tickFormatter={yFormat} width="auto" />
        <RBar dataKey="y" fill="var(--primary)" />
        <Tooltip
          wrapperStyle={{ zIndex: 10 }}
          contentStyle={{ backgroundColor: "var(--background)" }}
          labelStyle={{ color: "var(--text-on-light)" }}
          content={customTooltip}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
