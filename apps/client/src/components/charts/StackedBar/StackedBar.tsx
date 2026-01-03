import React from "react";
import {
  BarChart,
  XAxis,
  Bar as RBar,
  Tooltip,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { ContentType } from "recharts/types/component/Tooltip";
import { getColor } from "../../../services/colors";

export interface StackedBarProps {
  data: ({
    x: number | string;
  } & { [o: string]: number })[];
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
}: StackedBarProps) {
  const allKeys = data.reduce<Set<string>>((acc, curr) => {
        Object.keys(curr)
          .filter(key => key !== "x")
          .forEach(key => acc.add(key));
        return acc;
      }, new Set());

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis
          dataKey="x"
          tickFormatter={xFormat}
          tick={customXTick}
          style={{ fontWeight: "bold" }}
        />
        <YAxis tickFormatter={yFormat} width="auto" />
        {Array.from(allKeys).map((k, index) => (
          <RBar key={k} stackId="only" dataKey={k} fill={getColor(index)} />
        ))}
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
