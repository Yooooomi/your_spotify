import { useEffect, useMemo, useRef, useState } from 'react';
import { UnboxPromise } from './types';

export function useAPI<Fn extends (...ags: any[]) => Promise<{ data: D }>, D>(
  call: Fn,
  ...args: Parameters<Fn>
): null | UnboxPromise<ReturnType<Fn>>['data'] {
  // Allows for instant nullify of request in case of deps change
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [value, setValue] = useState<UnboxPromise<ReturnType<Fn>>['data'] | null>(null);
  const ref = useRef<UnboxPromise<ReturnType<Fn>>['data'] | null>(null);

  useMemo(() => {
    ref.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...args]);

  useEffect(() => {
    async function fetch() {
      const result = await call(...args);
      ref.current = result.data;
      setValue(result.data);
    }

    ref.current = null;
    setValue(null);
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...args, call]);

  return ref.current;
}

export function useConditionalAPI<Fn extends (...ags: any[]) => Promise<{ data: D }>, D>(
  condition: boolean,
  call: Fn,
  ...args: Parameters<Fn>
): null | UnboxPromise<ReturnType<Fn>>['data'] {
  const [value, setValue] = useState<UnboxPromise<ReturnType<Fn>>['data'] | null>(null);

  useEffect(() => {
    async function fetch() {
      const result = await call(...args);
      setValue(result.data);
    }

    setValue(null);
    if (condition) {
      fetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...args, condition, call]);

  return value;
}
