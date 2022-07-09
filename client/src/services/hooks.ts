import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { detailIntervalToQuery } from './intervals';
import {
  selectIntervalDetail,
  selectUser,
} from './redux/modules/user/selector';
import { UnboxPromise } from './types';

export function useAPI<Fn extends (...ags: any[]) => Promise<{ data: D }>, D>(
  call: Fn,
  ...args: Parameters<Fn>
): null | UnboxPromise<ReturnType<Fn>>['data'] {
  // Allows for instant nullify of request in case of deps change
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [value, setValue] = useState<
    UnboxPromise<ReturnType<Fn>>['data'] | null
  >(null);
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

export function useConditionalAPI<
  Fn extends (...ags: any[]) => Promise<{ data: D }>,
  D,
>(
  condition: boolean,
  call: Fn,
  ...args: Parameters<Fn>
): null | UnboxPromise<ReturnType<Fn>>['data'] {
  const [value, setValue] = useState<
    UnboxPromise<ReturnType<Fn>>['data'] | null
  >(null);

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

export function useShareLink() {
  const user = useSelector(selectUser);
  const interval = useSelector(selectIntervalDetail);

  if (!user) {
    return undefined;
  }
  const search = new URLSearchParams(window.location.search);
  Object.entries(detailIntervalToQuery(interval, 'g')).forEach(
    ([key, value]) => {
      search.set(key, value);
    },
  );
  if (user.publicToken) {
    search.set('token', user.publicToken);
  }
  return `${window.location.origin}${
    window.location.pathname
  }?${search.toString()}`;
}

export function useNavigateAndSearch() {
  const navigate = useNavigate();
  const [query] = useSearchParams();

  return useCallback(
    (url: string, params: Record<string, string | undefined>) => {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.set(key, value);
        }
      });
      navigate(`${url}?${query.toString()}`);
    },
    [navigate, query],
  );
}
