import { cloneElement, ReactElement, useRef } from "react";
import { useBooleanState, useLongPress } from "../../services/hooks/hooks";
import { Track } from "../../services/types";
import Dialog from "../Dialog";
import TrackOptionsContent from "../TrackOptionsContent";

interface LongClickableTrackProps {
  children: ReactElement;
  track: Track;
}

export default function LongClickableTrack({
  children,
  track,
}: LongClickableTrackProps) {
  const [isOpen, open, close] = useBooleanState();
  const divProps = useLongPress(open);

  return (
    <>
      {cloneElement(children, divProps)}
      <Dialog title={track.name} onClose={close} open={isOpen} fullWidth>
        <TrackOptionsContent track={track} onClose={close} />
      </Dialog>
    </>
  );
}
