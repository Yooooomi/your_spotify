import { Link } from "react-router-dom";
import { HTMLTag, Track, TrackWithAlbum } from "../../services/types";
import Text, { TextProps } from "../Text/Text";
import s from "./index.module.css";

type InlineTrackProps<T extends HTMLTag> = Omit<TextProps<T>, "children"> & {
  track: Track | TrackWithAlbum;
};

export default function InlineTrack<T extends HTMLTag = "div">({
  track,
  ...other
}: InlineTrackProps<T>) {
  return (
     
    <Text title={track.name} {...other}>
      <Link to={`/song/${track.id}`} className={s.root}>
        {track.name}
      </Link>
    </Text>
  );
}
