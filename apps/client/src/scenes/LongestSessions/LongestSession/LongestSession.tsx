import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import clsx from "clsx";
import { useMemo, useState } from "react";
import ImageTwoLines from "../../../components/ImageTwoLines";
import InlineArtist from "../../../components/InlineArtist";
import InlineTrack from "../../../components/InlineTrack";
import PlayButton from "../../../components/PlayButton";
import Text from "../../../components/Text";
import { intervalToHoursAndMinutes } from "../../../services/date";
import { useLoadArtists } from "../../../services/hooks/artist";
import { dateToListenedAt } from "../../../services/stats";
import { TrackInfoWithTrack } from "../../../services/types";
import s from "./index.module.css";

interface LongestSessionProps {
  tracks: TrackInfoWithTrack[];
}

export default function LongestSession({ tracks }: LongestSessionProps) {
  const artistIds = useMemo(
    () => [
      ...tracks.reduce((acc, track) => {
        const artist = track.track.artists[0];
        if (!artist) {
          return acc;
        }
        acc.add(artist);
        return acc;
      }, new Set<string>()),
    ],
    [tracks],
  );
  const { loaded, artists } = useLoadArtists(artistIds);
  const [expanded, setExpanded] = useState(false);

  const totalDuration = useMemo(() => {
    const first = tracks[0];
    const last = tracks[tracks.length - 1];
    if (!first || !last) {
      return "";
    }
    return intervalToHoursAndMinutes(
      new Date(first.played_at),
      new Date(new Date(last.played_at).getTime() + last.track.duration_ms),
    );
  }, [tracks]);

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
        <Text>
          {dateToListenedAt(new Date(firstTrack.played_at))} for {totalDuration}{" "}
          ({tracks.length} songs)
        </Text>
      </AccordionSummary>
      <AccordionDetails>
        {tracks.map((track, index) => {
          const artist = artists[track.track.artists[0] ?? ""];
          return (
            <div key={track._id} className={clsx("play-button-holder", s.line)}>
              <Text>#{index + 1}</Text>
              <ImageTwoLines
                image={
                  <PlayButton
                    id={track.id}
                    covers={artists[track.track.artists[0] ?? ""]?.images ?? []}
                  />
                }
                first={<InlineTrack track={track.track} />}
                second={artist ? <InlineArtist artist={artist} /> : null}
              />
            </div>
          );
        })}
      </AccordionDetails>
    </Accordion>
  );
}
