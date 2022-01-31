import React, { useMemo } from "react";
import { api } from "../../../services/api";
import { useAPI } from "../../../services/hooks";
import { Timesplit } from "../../../services/types";
import TitleCard from "../../TitleCard";
import { ImplementedCardProps } from "../types";
import s from "../index.module.css";
import { getLastPeriod, getPercentMore } from "../../../services/stats";
import clsx from "clsx";

interface SongsListenedProps extends ImplementedCardProps {}

export default function SongsListened({
  interval,
  className,
}: SongsListenedProps) {
  const result = useAPI(
    api.songsPer,
    interval.start,
    interval.end,
    Timesplit.all
  );
  const lastPeriod = useMemo(
    () => getLastPeriod(interval.start, interval.end),
    [interval]
  );
  const resultOld = useAPI(
    api.songsPer,
    lastPeriod.start,
    lastPeriod.end,
    Timesplit.all
  );

  if (!result || !resultOld || resultOld.length === 0 || result.length === 0) {
    return null;
  }

  const percentMore = getPercentMore(resultOld[0].count, result[0].count);

  return (
    <TitleCard title="Songs listened">
      <div className={s.root}>
        <span className={s.number}>{result[0].count}</span>
        <span>
          <strong
            className={clsx({
              [s.more]: percentMore >= 0,
              [s.less]: percentMore < 0,
            })}
          >
            {Math.abs(percentMore)}%
          </strong>
          &nbsp;{percentMore < 0 ? "less" : "more"} than last period
        </span>
      </div>
    </TitleCard>
  );
}
