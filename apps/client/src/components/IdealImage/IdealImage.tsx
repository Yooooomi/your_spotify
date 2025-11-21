import { getAtLeastImage } from "../../services/tools";
import { HTMLProps, SpotifyImage } from "../../services/types";
import s from "./index.module.css";

interface IdealImageProps extends HTMLProps<"img"> {
  images: SpotifyImage[] | null;
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
      src={images ? getAtLeastImage(images, size) : "no_data.png"}
      height={size}
      width={size}
       
      {...other}
    />
  );
}
