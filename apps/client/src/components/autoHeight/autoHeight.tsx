import { ReactNode, useEffect, useRef, useState } from "react";

interface AutoHeightProps {
  children: ReactNode;
  maxHeight?: number;
}

export function AutoHeight({ children, maxHeight }: AutoHeightProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const element = ref.current;
      if (!element) {
        return;
      }
      let height = element.clientHeight;
      if (maxHeight) {
        height = Math.min(maxHeight, height);
      }
      setHeight(height);
    });
    observer.observe(ref.current)

    return () => {
      observer.disconnect();
    };
  }, [maxHeight])

  return <div style={{ height, width: "100%", transition: "height 300ms", overflow: "auto", position: "relative" }}>
    <div ref={ref} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
      {children}
    </div>
  </div>
}