import { Album, HTMLTag } from '../../services/types';
import Text from '../Text';
import { TextProps } from '../Text/Text';

type InlineTrackProps<T extends HTMLTag> = Omit<TextProps<T>, 'children'> & {
  album: Album;
};

export default function InlineTrack<T extends HTMLTag = 'div'>({
  album,
  ...other
}: InlineTrackProps<T>) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Text {...other} title={album.name}>
      {album.name}
    </Text>
  );
}
