import { getAtLeastImage } from '../../services/tools';
import { HTMLProps, SpotifyImage } from '../../services/types';

interface IdealImageProps extends HTMLProps<'img'> {
  images: SpotifyImage[];
  size: number;
}

export default function IdealImage({
  images,
  size,
  ...other
}: IdealImageProps) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <img alt="cover" src={getAtLeastImage(images, size)} {...other} />;
}
