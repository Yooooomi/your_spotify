import { ReactNode } from 'react';
import Text from '../Text';
import s from './index.module.css';

interface ImageTwoLinesProps {
  image: string;
  first: ReactNode;
  second: ReactNode;
}

export default function ImageTwoLines({
  image,
  first,
  second,
}: ImageTwoLinesProps) {
  return (
    <div className={s.root}>
      <img className={s.image} src={image} alt="album cover" />
      <div className={s.content}>
        <Text element="strong">{first}</Text>
        <Text>{second}</Text>
      </div>
    </div>
  );
}
