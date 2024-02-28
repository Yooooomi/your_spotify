import { getAtLeastImage } from "../../services/tools";
import { HTMLProps, SpotifyImage } from "../../services/types";

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
      alt="cover"
      src={getAtLeastImage(images, size)}
      height={size}
      width={size}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...other}
    />
  );
}
