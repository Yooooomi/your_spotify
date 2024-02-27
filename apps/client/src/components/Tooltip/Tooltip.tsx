import { TooltipProps } from "recharts";
import { Payload } from "recharts/types/component/DefaultTooltipContent";
import s from "./index.module.css";

type TypeFromArray<T> = T extends Array<infer K> ? K : never;

interface MyTooltipProps<D extends Array<unknown>>
  extends TooltipProps<any, any> {
  title: TitleFormatter<D>;
  value: ValueFormatter<D>;
  dontShowNullValues?: boolean;
}

export type TitleFormatter<D extends Array<unknown>> = (
  coordinates: { x: number; y: number },
  payload: TypeFromArray<D>,
) => React.ReactNode;
export type ValueFormatter<D extends Array<unknown>> = (
  payload: TypeFromArray<D>,
  valueDisplayed: number,
  root: Required<Payload<any, any>>,
) => React.ReactNode;

export default function Tooltip<DataTypeArray extends Array<unknown>>({
  payload,
  title,
  value,
  dontShowNullValues,
}: MyTooltipProps<DataTypeArray>) {
  const firstPayload = payload?.[0];
  if (!firstPayload) {
    return null;
  }

  return (
    <div className={s.root}>
      <div className={s.title}>
        {title(
          { x: firstPayload.payload.x, y: firstPayload.payload.y },
          firstPayload.payload,
        )}
      </div>
      <div className={s.content}>
        {payload
          ?.filter(p => p.value || !dontShowNullValues)
          .map(p => (
            <div key={p.dataKey} className={s.contentItem}>
              {value(
                p.payload as any,
                p.value,
                p as Required<Payload<any, any>>,
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
