import { MenuItem, Select } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { api } from "../../../services/apis/api";
import { useAPI } from "../../../services/hooks/hooks";
import { selectRawIntervalDetail } from "../../../services/redux/modules/user/selector";
import { UnboxPromise } from "../../../services/types";
import ChartCard from "../../ChartCard";
import StackedBar from "../../charts/StackedBar";
import { StackedBarProps } from "../../charts/StackedBar/StackedBar";
import Tooltip from "../../Tooltip";
import { TitleFormatter, ValueFormatter } from "../../Tooltip/Tooltip";
import LoadingImplementedChart from "../LoadingImplementedChart";
import { ImplementedChartProps } from "../types";
import { DateFormatter } from "../../../services/date";

interface BestOfHourProps extends ImplementedChartProps {}

enum Element {
  ARTIST = "artists",
  ALBUM = "albums",
  TRACK = "tracks",
}

const elementToCall = {
  [Element.ARTIST]: api.getBestArtistsOfHour,
  [Element.ALBUM]: api.getBestAlbumsOfHour,
  [Element.TRACK]: api.getBestSongsOfHour,
} as const;

function getElementName(
  result: UnboxPromise<
    ReturnType<(typeof elementToCall)[Element]>
  >["data"][number],
  id: string,
) {
  return result.full_items[id]?.name;
}

function getElementData(
  result: UnboxPromise<ReturnType<(typeof elementToCall)[Element]>>["data"],
  index: number,
) {
  const foundIndex = result.findIndex(r => r.hour === index);
  if (foundIndex === -1) {
    return { x: index };
  }
  const found = result[foundIndex];

  if (!found) {
    return { x: index };
  }

  const { total } = found;

  return found.items.reduce<StackedBarProps["data"][number]>(
    (acc, curr) => {
      acc[curr.itemId] = Math.floor((curr.total / total) * 1000) / 10;
      return acc;
    },
    { x: index },
  );
}

export default function BestOfHour({ className }: BestOfHourProps) {
  const { interval } = useSelector(selectRawIntervalDetail);
  const [element, setElement] = useState<Element>(Element.ARTIST);
  const result = useAPI(elementToCall[element], interval.start, interval.end);

  const data = useMemo(() => {
    if (!result) {
      return [];
    }
    return Array.from(Array(24).keys()).map(index =>
      getElementData(result, index),
    );
  }, [result]);

  const tooltipTitle = useCallback<TitleFormatter<typeof data>>(
    ({ x }) =>
      `20 most listened ${element} at ${DateFormatter.fromNumberToHour(x)}`,
    [element],
  );

  const tooltipValue = useCallback<ValueFormatter<typeof data>>(
    (payload, value, root) => {
      const foundIndex = result?.findIndex(r => r.hour === payload.x);
      if (!result || foundIndex === undefined || foundIndex === -1) {
        return null;
      }
      const found = result[foundIndex];
      if (!found) {
        return null;
      }
      return (
        <span style={{ color: root.color }}>
          {value}% of {getElementName(found, root.dataKey.toString())}
        </span>
      );
    },
    [result],
  );

  if (!result) {
    return (
      <LoadingImplementedChart
        title={`Best ${element} for hour of day`}
        className={className}
      />
    );
  }

  return (
    <ChartCard
      title={`Best ${element} for hour of day`}
      right={
        <Select
          value={element}
          onChange={ev => setElement(ev.target.value as Element)}
          variant="standard">
          {Object.values(Element).map(elem => (
            <MenuItem key={elem} value={elem}>
              {elem}
            </MenuItem>
          ))}
        </Select>
      }
      className={className}>
      <StackedBar
        data={data}
        xFormat={DateFormatter.fromNumberToHour}
        customTooltip={<Tooltip title={tooltipTitle} value={tooltipValue} />}
      />
    </ChartCard>
  );
}
