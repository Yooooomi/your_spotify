import { KeyboardEvent } from "react";

export function enterClicks(callback: () => void) {
  return (event: KeyboardEvent) => {
    if (event.key !== "Enter") {
      return;
    }
    callback();
  }
}