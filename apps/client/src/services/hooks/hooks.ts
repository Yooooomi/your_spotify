import { debounce, useMediaQuery } from "@mui/material";
import {
  TouchEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { detailIntervalToQuery } from "../intervals";
import {
  selectIntervalDetail,
  selectUser,
} from "../redux/modules/user/selector";
import { UnboxPromise } from "../types";

export function useAPI<Fn extends (...ags: any[]) => Promise<{ data: D }>, D>(
  call: Fn,
  ...args: Parameters<Fn>
): null | UnboxPromise<ReturnType<Fn>>["data"] {
  // Allows for instant nullify of request in case of deps change
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [value, setValue] = useState<
    UnboxPromise<ReturnType<Fn>>["data"] | null
  >(null);
  const ref = useRef<UnboxPromise<ReturnType<Fn>>["data"] | null>(null);

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
    fetch().catch(console.error);
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
): [null | UnboxPromise<ReturnType<Fn>>["data"], boolean] {
  const [value, setValue] = useState<
    UnboxPromise<ReturnType<Fn>>["data"] | null
  >(null);
  const loading = useRef(false);

  useEffect(() => {
    async function fetch() {
      const result = await call(...args);
      loading.current = false;
      setValue(result.data);
    }

    setValue(null);
    if (condition) {
      loading.current = true;
      fetch().catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...args, condition, call]);

  return [value, loading.current];
}

export function useShareLink() {
  const user = useSelector(selectUser);
  const interval = useSelector(selectIntervalDetail);

  if (!user) {
    return undefined;
  }
  const search = new URLSearchParams(window.location.search);
  Object.entries(detailIntervalToQuery(interval, "g")).forEach(
    ([key, value]) => {
      search.set(key, value);
    },
  );
  if (user.publicToken) {
    search.set("token", user.publicToken);
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

export function useSheetState() {
  const [open, setOpen] = useState(false);

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  const onOpen = useCallback(() => {
    setOpen(true);
  }, []);

  return [open, onOpen, onClose] as const;
}

export function useIsGuest() {
  const user = useSelector(selectUser);

  return !!user?.isGuest;
}

export function useResizeDebounce(
  cb: (width: number) => void,
  ref?: React.RefObject<HTMLDivElement>,
) {
  useEffect(() => {
    const cbWithWidth = () => cb(ref?.current?.clientWidth ?? 0);
    const internCb = debounce(cbWithWidth, 1000);
    setTimeout(cbWithWidth, 100);
    window.addEventListener("resize", internCb);
    return () => {
      window.removeEventListener("resize", internCb);
    };
  }, [cb, ref]);
}

export function useMobile(): [boolean, boolean] {
  return [
    useMediaQuery("(max-width: 960px)"),
    useMediaQuery("(max-width: 1250px)"),
  ];
}

export function useLongPress(callback: () => void, ms = 300) {
  const currentTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const stop = useCallback(() => {
    document.removeEventListener("scroll", stop);
    clearTimeout(currentTimeout.current);
    currentTimeout.current = undefined;
  }, []);

  const start = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      document.addEventListener("scroll", stop);
      event.preventDefault();
      event.stopPropagation();
      clearTimeout(currentTimeout.current);
      currentTimeout.current = setTimeout(callback, ms);
    },
    [callback, ms, stop],
  );

  return {
    onTouchStart: start,
    onTouchEnd: stop,
  };
}

export function useBooleanState(): [boolean, () => void, () => void] {
  const [open, setOpen] = useState(false);

  const onOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);

  return [open, onOpen, onClose];
}
