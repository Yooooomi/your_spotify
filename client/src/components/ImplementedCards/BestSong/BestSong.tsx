import React from "react";
import { api } from "../../../services/api";
import { useAPI } from "../../../services/hooks";
import { msToMinutes } from "../../../services/stats";
import { getImage } from "../../../services/tools";
import Card from "../../Card";
import TitleCard from "../../TitleCard";
import { ImplementedCardProps } from "../types";
import s from "./index.module.css";

interface BestSongProps extends ImplementedCardProps {}

export default function BestSong({ className, interval }: BestSongProps) {
  const result = useAPI(api.getBestSongs, interval.start, interval.end, 1, 0);

  if (!result || result.length === 0) {
    return null;
  }

  return (
    <TitleCard title="Best song" className={s.root}>
      <div className={s.container}>
        <div className={s.imgcontainer}>
          <img
            className={s.image}
            src={getImage(result[0].album)}
            alt="Your best song"
          />
        </div>
        <div className={s.stats}>
          <strong>{result[0].track.name}</strong>
          <div className={s.statnumbers}>
            <span className={s.stat}>
              <strong>{result[0].count}</strong> times listened
            </span>
            <span className={s.stat}>
              <strong>{msToMinutes(result[0].duration_ms)}</strong> minutes
              listened
            </span>
          </div>
        </div>
      </div>
    </TitleCard>
  );
}
