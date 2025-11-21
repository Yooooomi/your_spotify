import { useSelector } from "react-redux";
import clsx from "clsx";
import { Skeleton } from "@mui/material";
import { api } from "../../../services/apis/api";
import { useAPI } from "../../../services/hooks/hooks";
import { Timesplit } from "../../../services/types";
import TitleCard from "../../TitleCard";
import { ImplementedCardProps } from "../types";
import s from "../index.module.css";
import { getLastPeriod, getPercentMore } from "../../../services/stats";
import { selectRawIntervalDetail } from "../../../services/redux/modules/user/selector";
import Text from "../../Text";

interface SongsListenedProps extends ImplementedCardProps { }

export default function SongsListened({ className }: SongsListenedProps) {
  const { interval, unit } = useSelector(selectRawIntervalDetail);
  const result = useAPI(
    api.songsPer,
    interval.start,
    interval.end,
    Timesplit.all,
  );
  const lastPeriod = getLastPeriod(interval.start, interval.end);
  const resultOld = useAPI(
    api.songsPer,
    lastPeriod.start,
    lastPeriod.end,
    Timesplit.all,
  );

  if (!result || !resultOld) {
    return (
      <TitleCard title="Songs listened" className={className} fade>
        <div className={s.root}>
          <Text size="big">
            <Skeleton width={50} />
          </Text>
          <Text size="normal">
            <Skeleton width={200} />
          </Text>
        </div>
      </TitleCard>
    );
  }

  const count = result[0]?.count ?? 0;
  const oldCount = resultOld[0]?.count ?? 0;

  const different = result[0]?.differents ?? 0;

  const percentMore = getPercentMore(oldCount, count);

  return (
    <TitleCard title="Songs listened" className={className} fade>
      <div className={s.root}>
        <div className={s.twonumbers}>
          <Text size='huge'>{count}</Text>
          <Text size='small'>{different} diff.</Text>
        </div>
        <Text size="normal">
          <Text
            size='normal'
            element="strong"
            className={clsx({
              [s.more]: percentMore >= 0,
              [s.less]: percentMore < 0,
            })}>
            {Math.abs(percentMore)}%
          </Text>
          <Text element="span" size='normal'>
            &nbsp;
            {percentMore < 0 ? "less" : "more"} than last {unit}
          </Text>
        </Text>
      </div>
    </TitleCard>
  );
}
