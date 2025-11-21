import clsx from "clsx";
import React, { HTMLElementType, ReactNode } from "react";
import { HTMLTag, HTMLProps } from "../../services/types";
import s from "./index.module.css";

const sizes = {
  small: 12,
  normal: 16,
  big: 18,
  huge: 26,
  pagetitle: 32,
};

export type TextProps<T extends HTMLTag> = HTMLProps<T> & {
  className?: string;
  children: ReactNode;
  element?: T;
  onDark?: boolean;
  noStyle?: boolean;
  size: keyof typeof sizes;
  weight?: "bold";
  greyed?: boolean;
};

export default function Text<T extends HTMLElementType = "span">({
  className,
  children,
  element,
  onDark,
  noStyle,
  size,
  weight,
  greyed,
  ...other
}: TextProps<T>) {
  return React.createElement(
    element ?? "span",
    {
      style: { fontSize: sizes[size], fontWeight: weight, color: greyed ? 'var(--text-grey)' : undefined },
      className: clsx(

        noStyle ? undefined : onDark ? s.onDark : s.root,
        className,
      ),
      ...other,
    },
    children,
  );
}
