import { useSelector } from "react-redux";
import { Skeleton } from "@mui/material";
import clsx from "clsx";
import { api } from "../../../services/apis/api";
import { useAPI } from "../../../services/hooks/hooks";
import { msToMinutes } from "../../../services/stats";
import { getImage } from "../../../services/tools";
import TitleCard from "../../TitleCard";
import { ImplementedCardProps } from "../types";
import { selectRawIntervalDetail } from "../../../services/redux/modules/user/selector";
import Text from "../../Text";
import InlineTrack from "../../InlineTrack";
import s from "./index.module.css";

interface BestSongProps extends ImplementedCardProps { }

export default function BestSong({ className }: BestSongProps) {
  const { interval } = useSelector(selectRawIntervalDetail);
  const result = useAPI(api.getBestSongs, interval.start, interval.end, 1, 0);

  if (!result) {
    return (
      <TitleCard title="Best song" className={clsx(s.root, className)}>
        <div className={s.container}>
          <div className={s.imgcontainer}>
            <Skeleton
              className={clsx(s.image, s.skeleton)}
              variant="rectangular"
              height="100%"
            />
          </div>
          <div className={s.stats}>
            <Skeleton width="40%" />
            <div className={s.statnumbers}>
              <Text size="big">
                <Skeleton width="60%" />
              </Text>
              <Text size="big">
                <Skeleton width="50%" />
              </Text>
            </div>
          </div>
        </div>
      </TitleCard>
    );
  }

  const res = result[0];

  return (
    <TitleCard title="Best song" className={clsx(s.root, className)}>
      <div className={s.container}>
        <div className={s.imgcontainer}>
          <img
            className={s.image}
            src={getImage(res?.album)}
            alt="Your best song"
          />
        </div>
        <div className={s.stats}>
          {res && (
            <InlineTrack element="strong" size="huge" track={res.track} />
          )}
          {!res && (
            <Text element="strong" size="big">
              No data
            </Text>
          )}
          <div className={s.statnumbers}>
            <Text size="big">
              <Text element="strong" size="big">
                {res?.count ?? 0}
              </Text>{" "}
              times listened
            </Text>
            <Text size="big">
              <Text element="strong" size="big">
                {msToMinutes(res?.duration_ms ?? 0)}
              </Text>{" "}
              minutes listened
            </Text>
          </div>
        </div>
      </div>
    </TitleCard>
  );
}
