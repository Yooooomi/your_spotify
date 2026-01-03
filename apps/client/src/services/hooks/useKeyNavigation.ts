import { RefObject, useEffect, useRef } from "react";
import { useKey } from "./useKey";
import { useMousePosition } from "./useMousePosition";

interface UseKeyNavigationProps {
  root: RefObject<HTMLElement | null>;
  restoreFocusOnOverflowTop?: RefObject<HTMLElement | null>;
  restoreFocusOnOverflowBottom?: RefObject<HTMLElement | null>;
}

export function useKeyNavigation({ root, restoreFocusOnOverflowBottom, restoreFocusOnOverflowTop }: UseKeyNavigationProps) {
  const elements = useRef<Array<Element>>([]);

  const mousePosition = useMousePosition();
  const lastHoveredElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    elements.current = root.current ? Array.from(root.current.querySelectorAll("[tabindex]")) : [];
    // eslint-disable-next-line react-hooks/purity, react-hooks/exhaustive-deps
  }, [root, Math.random()])

  function getCurrentIndex() {
    let currentIndex = -1;
    const hovered = document.elementFromPoint(mousePosition.current.x, mousePosition.current.y);

    const oldElement = lastHoveredElement.current;

    if (hovered === null || hovered instanceof HTMLElement) {
      lastHoveredElement.current = hovered;
    }
  
    if (hovered && oldElement !== hovered) {
      currentIndex = elements.current.indexOf(hovered);
    }
    if (currentIndex === -1) {
      currentIndex = document.activeElement ? elements.current.indexOf(document.activeElement) : -1;
    }
    return currentIndex
  }

  function handleUp() {
    const currentIndex = getCurrentIndex()

    if (currentIndex === 0) {
      restoreFocusOnOverflowTop?.current?.focus();
      return;
    }

    const nextElement = elements.current[currentIndex - 1];
    if (nextElement instanceof HTMLElement) {
      nextElement.focus();
    }
  }

  function handleDown() {
    const currentIndex = getCurrentIndex()

    if (currentIndex === elements.current.length - 1) {
      restoreFocusOnOverflowBottom?.current?.focus();
      return;
    }

    const nextElement = elements.current[currentIndex + 1];
    if (nextElement instanceof HTMLElement) {
      nextElement.focus();
    }
  }

  useKey("ArrowDown", handleDown);
  useKey("ArrowUp", handleUp);
}