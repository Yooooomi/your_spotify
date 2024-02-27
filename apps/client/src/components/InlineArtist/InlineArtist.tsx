import { Link } from "react-router-dom";
import { Artist, HTMLTag } from "../../services/types";
import Text from "../Text";
import { TextProps } from "../Text/Text";
import s from "./index.module.css";

type InlineArtistProps<T extends HTMLTag> = Omit<TextProps<T>, "children"> & {
  artist: Artist;
};

export default function InlineArtist<T extends HTMLTag = "div">({
  artist,
  ...other
}: InlineArtistProps<T>) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Text title={artist.name} {...other}>
      <Link to={`/artist/${artist.id}`} className={s.root}>
        {artist.name}
      </Link>
    </Text>
  );
}
