import { ReactNode } from "react";
import { SpotifyImage } from "../../../services/types";
import TitleCard from "../../../components/TitleCard";
import IdealImage from "../../../components/IdealImage";
import ImageTwoLines from "../../../components/ImageTwoLines";
import { DateFormatter } from "../../../services/date";
import s from "./index.module.css";

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
          second={`Last listened on ${DateFormatter.listenedAt(new Date(lastDate))}`}
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
          second={`First listened on ${DateFormatter.listenedAt(new Date(firstDate))}`}
        />
      </div>
    </TitleCard>
  );
}
