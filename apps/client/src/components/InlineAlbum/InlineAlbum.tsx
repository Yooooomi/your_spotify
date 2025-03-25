import { Link } from "react-router-dom";
import { Album, HTMLTag } from "../../services/types";
import Text from "../Text";
import { TextProps } from "../Text/Text";
import s from "./index.module.css";

type InlineAlbumProps<T extends HTMLTag> = Omit<TextProps<T>, "children"> & {
  album: Album;
};

export default function InlineAlbum<T extends HTMLTag = "div">({
  album,
  ...other
}: InlineAlbumProps<T>) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Text {...other} title={album.name}>
      <Link to={`/album/${album.id}`} className={s.root}>
        {album.name}
      </Link>
    </Text>
  );
}
