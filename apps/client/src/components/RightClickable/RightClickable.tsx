import {
  MouseEvent,
  ReactNode,
  useContext,
} from "react";
import { SelectableContext } from "../Selectable/Selectable.context";
import { Pointer } from "../../services/pointer";

export interface VirtualElement {
  getBoundingClientRect: () => DOMRect;
}

interface RightClickableProps {
  children: ReactNode;
  onRightClick: (
    position: VirtualElement,
    event: MouseEvent<HTMLDivElement, MouseEvent>,
  ) => void;
  index: number;
}

function eventToVirtualElement(
  event: MouseEvent<HTMLDivElement, MouseEvent>,
): VirtualElement {
  const x = event.clientX;
  const y = event.clientY;

  return {
    getBoundingClientRect: () => ({
      width: 0,
      height: 0,
      top: y,
      right: x,
      bottom: y,
      left: x,
      x,
      y,
      toJSON() {
        return this;
      },
    }),
  };
}

export function RightClickable({
  children,
  onRightClick,
  index,
}: RightClickableProps) {
  const { select } = useContext(SelectableContext);

  const handleRightClick = event => {
      if (Pointer.type !== "mouse") {
        return;
      }
      event.preventDefault();
      onRightClick(eventToVirtualElement(event as any), event as any);
      select(index, "ifnotselected");
    };

  return <div onContextMenu={handleRightClick}>{children}</div>;
}
