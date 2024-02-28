import clsx from "clsx";
import {
  cloneElement,
  forwardRef,
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

export const GridRowWrapper = forwardRef<HTMLDivElement, GridRowWrapperProps>(
  ({ columns, className, ...other }, ref) => {
    return (
      <div
        className={clsx(s.rowwrapper, className)}
        // eslint-disable-next-line react/jsx-props-no-spreading
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
  },
);

type GridWrapperProps = HTMLProps<"div">;

export function GridWrapper(props: GridWrapperProps) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <div className={s.wrapper} {...props} />;
}
