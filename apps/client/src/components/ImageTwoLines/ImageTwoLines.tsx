import clsx from "clsx";
import { ReactNode } from "react";
import Text from "../Text";
import s from "./index.module.css";

interface ImageTwoLinesProps {
  className?: string;
  image: ReactNode;
  first: ReactNode;
  second: ReactNode;
}

export default function ImageTwoLines({
  className,
  image,
  first,
  second,
}: ImageTwoLinesProps) {
  return (
    <div className={clsx(s.root, className)}>
      {image}
      <div className={s.content}>
        <Text element="strong" className={s.first}>
          {first}
        </Text>
        <Text>{second}</Text>
      </div>
    </div>
  );
}
