import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import clsx from "clsx";
import { useState } from "react";
import ImageTwoLines from "../../../components/ImageTwoLines";
import InlineArtist from "../../../components/InlineArtist";
import InlineTrack from "../../../components/InlineTrack";
import PlayButton from "../../../components/PlayButton";
import Text from "../../../components/Text";
import {
  DateFormatter,
  intervalToHoursAndMinutes,
} from "../../../services/date";
import { useLoadArtists } from "../../../services/hooks/artist";
import { Track, TrackInfo } from "../../../services/types";
import s from "./index.module.css";

interface LongestSessionProps {
  tracks: TrackInfo[];
  fullTracks: Record<string, Track>;
}

export default function LongestSession({
  tracks,
  fullTracks,
}: LongestSessionProps) {
  const artistIds = [
      ...tracks.reduce((acc, track) => {
        acc.add(track.primaryArtistId);
        return acc;
      }, new Set<string>()),
    ];
  const { loaded, artists } = useLoadArtists(artistIds);
  const [expanded, setExpanded] = useState(false);

  const totalDuration = (() => {
    const first = tracks[0];
    const last = tracks[tracks.length - 1];
    if (!first || !last) {
      return "";
    }
    return intervalToHoursAndMinutes(
      new Date(first.played_at),
      new Date(new Date(last.played_at).getTime() + last.durationMs),
    );
  })();

  const [firstTrack] = tracks;

  if (!loaded || !firstTrack) {
    return null;
  }

  return (
    <Accordion
      elevation={0}
      className={s.accordion}
      expanded={expanded}
      onChange={(_, value) => setExpanded(value)}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Text size="normal">
          {DateFormatter.listenedAt(new Date(firstTrack.played_at))} for{" "}
          {totalDuration} ({tracks.length} songs)
        </Text>
      </AccordionSummary>
      <AccordionDetails>
        {tracks.map((track, index) => {
          const artist = artists[track.primaryArtistId];
          const fullTrack = fullTracks[track.id];
          return (
            <div key={track._id} className={clsx("play-button-holder", s.line)}>
              <Text size="normal">#{index + 1}</Text>
              <ImageTwoLines
                image={
                  <PlayButton
                    id={track.id}
                    covers={artists[track.primaryArtistId]?.images ?? []}
                  />
                }
                first={fullTrack ? <InlineTrack size='normal' track={fullTrack} /> : null}
                second={
                  artist ? (
                    <InlineArtist size='normal' className={s.artist} artist={artist} />
                  ) : null
                }
              />
            </div>
          );
        })}
      </AccordionDetails>
    </Accordion>
  );
}
