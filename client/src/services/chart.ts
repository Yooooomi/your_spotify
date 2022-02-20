import { useCallback } from 'react';
import { Payload, NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

export const useRawTooltipLabelFormatter = <D extends { x: number; y: number; date: Date }>(
  tooltipLabelFormatter?: (value: string, payload: D) => string,
  forEveryEntry = true,
) => {
  const fn = useCallback(
    <T extends NameType, V extends ValueType>(label: string, payload: Payload<V, T>[]) => {
      if (tooltipLabelFormatter) {
        if (forEveryEntry) {
          return payload?.map((p) => tooltipLabelFormatter(label, p.payload));
        }
        const p = payload[0];
        if (!p) {
          return label;
        }
        return tooltipLabelFormatter(label, p.payload);
      }
      return label;
    },
    [forEveryEntry, tooltipLabelFormatter],
  );
  return fn;
};

export const useRawTooltipValueFormatter = <D extends { x: number; y: number; date: Date }>(
  tooltipValueFormatter?: (value: number, payload: D) => string,
) => {
  const fn = useCallback(
    (value: any, b: any, pr: any) => {
      if (tooltipValueFormatter) {
        return [tooltipValueFormatter(value, pr.payload), null];
      }
      return value;
    },
    [tooltipValueFormatter],
  );
  return fn;
};
