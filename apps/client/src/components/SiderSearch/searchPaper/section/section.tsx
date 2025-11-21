import { enterClicks } from "../../../../services/html";
import { SpotifyImage } from "../../../../services/types";
import IdealImage from "../../../IdealImage";
import Text from "../../../Text";
import s from './index.module.css'

interface SectionProps<T extends { id: string, name: string }> {
  title: string;
  items: Array<T> | undefined;
  onClick: (item: T) => void;
  getImages: (item: T) => Array<SpotifyImage>
}

export function Section<T extends { id: string; name: string }>({ title, items, onClick, getImages }: SectionProps<T>) {
  const shouldDisplay = items && items.length > 0;

  if (!shouldDisplay) {
    return null;
  }

  return (
    <div className={s.section}>
      <Text size="big" greyed className={s.sticky}>{title}</Text>
      <div className={s.results}>
        {items?.map(item => (
          <div
            key={item.id}
            tabIndex={1}
            className={s.result}
            role="button"
            onClick={() => onClick(item)}
            onKeyDown={enterClicks(() => onClick(item))}>
            <IdealImage
              className={s.cover}
              images={getImages(item)}
              size={48}
            />
            <Text size='big' className={s.name}>
              {item.name}
            </Text>
          </div>
        ))}
      </div>
    </div>
  )
}