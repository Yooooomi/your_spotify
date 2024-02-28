import { commonUnits } from "../../Grid/commonUnits";

export const trackGrid = {
  cover: { unit: commonUnits.cover, key: "cover" },
  title: { unit: commonUnits.mainTitle, key: "title" },
  album: { unit: commonUnits.secondaryTitle, key: "album" },
  duration: { unit: commonUnits.duration, key: "duration" },
  listened: { unit: commonUnits.date, key: "listened" },
  option: { unit: commonUnits.options, key: "option" },
} as const;
