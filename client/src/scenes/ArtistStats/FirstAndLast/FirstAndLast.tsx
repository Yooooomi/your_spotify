import { ReactNode } from 'react';
import { dateToListenedAt } from '../../../services/stats';
import { SpotifyImage } from '../../../services/types';
import TitleCard from '../../../components/TitleCard';
import s from './index.module.css';
import IdealImage from '../../../components/IdealImage';
import ImageTwoLines from '../../../components/ImageTwoLines';

interface FirstAndLastProps {
  firstImages: SpotifyImage[];
  lastImages: SpotifyImage[];
  firstDate: Date;
  lastDate: Date;
  firstElement: ReactNode;
  lastElement: ReactNode;
}

export default function FirstAndLast({
  firstDate,
  lastDate,
  firstImages,
  lastImages,
  firstElement,
  lastElement,
}: FirstAndLastProps) {
  return (
    <TitleCard title="First and last time listened">
      <div className={s.item}>
        <ImageTwoLines
          image={
            <IdealImage
              className={s.cover}
              images={lastImages}
              size={48}
              alt="album cover"
            />
          }
          first={lastElement}
          second={`Last listened on ${dateToListenedAt(new Date(lastDate))}`}
        />
      </div>
      <div className={s.item}>
        <ImageTwoLines
          image={
            <IdealImage
              className={s.cover}
              images={firstImages}
              size={48}
              alt="cover"
            />
          }
          first={firstElement}
          second={`First listened on ${dateToListenedAt(new Date(firstDate))}`}
        />
      </div>
    </TitleCard>
  );
}
