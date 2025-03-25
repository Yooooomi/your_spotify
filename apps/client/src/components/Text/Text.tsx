import clsx from "clsx";
import React, { HTMLElementType, JSX, ReactNode } from "react";
import { HTMLTag, HTMLProps } from "../../services/types";
import s from "./index.module.css";

export type TextProps<T extends HTMLTag> = HTMLProps<T> & {
  className?: string;
  children: ReactNode;
  element?: T;
  onDark?: boolean;
  noStyle?: boolean;
};

export default function Text<T extends HTMLElementType = "span">({
  className,
  children,
  element,
  onDark,
  noStyle,
  ...other
}: TextProps<T>) {
  return React.createElement(
    element ?? "span",
    {
      className: clsx(
        // eslint-disable-next-line no-nested-ternary
        noStyle ? undefined : onDark ? s.onDark : s.root,
        className,
      ),
      ...other,
    },
    children,
  );
}
