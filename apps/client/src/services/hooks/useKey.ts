import { useEffect, useRef } from "react";

export function useKey(key: string, callback: () => void) {
  const ref = useRef(callback);
  ref.current = callback;

  useEffect(() => {
    function handler(event: KeyboardEvent) {
      if (event.key !== key) {
        return;
      }
      event.preventDefault();
      ref.current();
    }

    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler)
    }
  }, [key])
}