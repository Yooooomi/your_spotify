import {
  Payload,
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import Text from "../components/Text";
import { DateWithPrecision } from "./stats";

export const useRawTooltipLabelFormatter = <
  D extends { x: number; y: number; dateWithPrecision: DateWithPrecision },
>(
  tooltipLabelFormatter?: (value: string, payload: D) => string,
  forEveryEntry = true,
) => {
  const fn = <T extends NameType, V extends ValueType>(
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
        return <Text element="span" size='normal'>{label}</Text>;
      }
      return (
        <Text element="span" size='normal'>{tooltipLabelFormatter(label, p.payload)}</Text>
      );
    }
    return <Text element="span" size='normal'>{label}</Text>;
  };
  return fn;
};

export const useRawTooltipValueFormatter = <
  D extends { x: number; y: number; dateWithPrecision: DateWithPrecision },
>(
  tooltipValueFormatter?: (value: number, payload: D) => string,
) => {
  return function (value: any, b: any, pr: any) {
    if (tooltipValueFormatter) {
      return [tooltipValueFormatter(value, pr.payload), null];
    }
    return value;
  }
};
