import { useEffect, useRef } from "react";

export interface MousePosition {
  x: number;
  y: number
}

export function useMousePosition() {
  const mousePosition = useRef<MousePosition>({ x: 0, y: 0 })

  useEffect(() => {
    function handle(event: MouseEvent) {
      mousePosition.current = { x: event.clientX, y: event.clientY }
    }

    document.addEventListener("mousemove", handle);

    return () => document.removeEventListener("mousemove", handle)
  }, [])

  return mousePosition
}