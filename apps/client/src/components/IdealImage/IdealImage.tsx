import { getAtLeastImage } from "../../services/tools";
import { HTMLProps, SpotifyImage } from "../../services/types";
import s from "./index.module.css";

interface IdealImageProps extends HTMLProps<"img"> {
  images: SpotifyImage[];
  size: number;
}

export default function IdealImage({
  images,
  size,
  ...other
}: IdealImageProps) {
  return (
    <img
      className={s.image}
      alt="cover"
      src={getAtLeastImage(images, size)}
      height={size}
      width={size}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...other}
    />
  );
}
