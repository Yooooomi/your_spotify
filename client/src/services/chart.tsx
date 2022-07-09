import { useCallback } from 'react';
import {
  Payload,
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';
import { DateWithPrecision } from './stats';
import Text from '../components/Text';

export const useRawTooltipLabelFormatter = <
  D extends { x: number; y: number; dateWithPrecision: DateWithPrecision },
>(
  tooltipLabelFormatter?: (value: string, payload: D) => string,
  forEveryEntry = true,
) => {
  const fn = useCallback(
    <T extends NameType, V extends ValueType>(
      label: string,
      payload?: Payload<V, T>[],
    ) => {
      if (!payload) {
        return null;
      }
      if (tooltipLabelFormatter) {
        if (forEveryEntry) {
          return payload?.map(p => tooltipLabelFormatter(label, p.payload));
        }
        const p = payload[0];
        if (!p) {
          return <Text element="span">{label}</Text>;
        }
        return (
          <Text element="span">{tooltipLabelFormatter(label, p.payload)}</Text>
        );
      }
      return <Text element="span">{label}</Text>;
    },
    [forEveryEntry, tooltipLabelFormatter],
  );
  return fn;
};

export const useRawTooltipValueFormatter = <
  D extends { x: number; y: number; dateWithPrecision: DateWithPrecision },
>(
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
