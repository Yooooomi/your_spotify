import React, { useCallback } from "react";
import s from "./index.module.css";
import clsx from "clsx";
import { msToMinutesAndSeconds } from "../../../../services/stats";
import { Artist as ArtistType } from "../../../../services/types";
import InlineArtist from "../../../../components/InlineArtist";
import { useMediaQuery } from "@material-ui/core";

interface ArtistProps {
  line?: false;
  artist: ArtistType;
  count: number;
  totalCount: number;
  duration: number;
  totalDuration: number;
}

interface HeaderArtistProps {
  line: true;
}

export default function Artist(props: ArtistProps | HeaderArtistProps) {
  const upmd = useMediaQuery("(min-width: 1150px)");

  if (props.line) {
    return (
      <div className={s.root}>
        <span className={s.artistname}>Artist name</span>
        <span className={clsx(s.sumcount, s.header)}>Count</span>
        <span className={clsx(s.sumduration, s.header)}>Total duration</span>
      </div>
    );
  }

  const { artist, duration, totalDuration, count, totalCount } = props;
  return (
    <div className={s.root}>
      <span className={s.artistname}>
        <InlineArtist artist={artist} />
      </span>
      <span className={s.sumcount}>
        {count}{" "}
        {upmd && (
          <span>({Math.floor((count / totalCount) * 10000) / 100})</span>
        )}
      </span>
      <span className={s.sumduration}>
        {msToMinutesAndSeconds(duration)}{" "}
        {upmd && (
          <span>({Math.floor((duration / totalDuration) * 10000) / 100})</span>
        )}
      </span>
    </div>
  );
}
