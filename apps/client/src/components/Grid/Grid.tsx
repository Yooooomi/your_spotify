import clsx from "clsx";
import {
  cloneElement,
  isValidElement,
  ReactElement,
  ReactNode,
} from "react";
import { HTMLProps } from "../../services/types";
import s from "./index.module.css";

export interface ColumnDescription {
  unit: string;
  node: ReactNode;
  key: string;
}

interface GridRowWrapperProps extends HTMLProps<"div"> {
  columns: ColumnDescription[];
}

export function GridRowWrapper({ ref, columns, className, ...other }: GridRowWrapperProps) {
  return (
    <div
      className={clsx(s.rowwrapper, className)}

      {...other}
      ref={ref}
      style={{
        gridTemplateColumns: columns
          .filter(c => c.node)
          .map(c => c.unit)
          .join(" "),
      }}>
      {columns
        .filter(c => isValidElement(c.node))
        .map(c => cloneElement(c.node as ReactElement, { key: c.key }))}
    </div>
  );
}

type GridWrapperProps = HTMLProps<"div">;

export function GridWrapper(props: GridWrapperProps) {

  return <div className={s.wrapper} {...props} />;
}
