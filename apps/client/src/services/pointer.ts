import { useEffect } from "react";

type PointerType = "mouse" | "other";

export class Pointer {
  static type: PointerType = "other";
}

export function useDetectPointerType() {
  useEffect(
    () =>
      document.addEventListener("pointerdown", e => {
        Pointer.type = e.pointerType === "mouse" ? "mouse" : "other";
      }),
    [],
  );
}
