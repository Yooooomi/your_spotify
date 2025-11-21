import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import { noop } from "./tools";

interface ShortcutsContext {
  register: (sequence: string, callback: () => void) => void;
}

export const ShortcutsContext = createContext<ShortcutsContext>({
  register: noop,
});

interface ShortcutsContextProviderProps {
  children: ReactNode;
}

export function stringifySequence(sequence: string) {
  function getString(key: string) {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    if (key === "Meta" && isMac) {
      return "cmd";
    }
    if (key === "Meta" && !isMac) {
      return 'ctrl';
    }
    return key.toLowerCase()
  }

  return sequence.split("+").map(getString).join("+");
}

function normalizeSequence(sequence: string) {
  const parts = sequence.split("+");
  const modifiers: string[] = [];
  const nonModifiers: string[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (["Meta", "Ctrl", "Shift", "Alt"].includes(trimmed)) {
      modifiers.push(trimmed);
    } else {
      nonModifiers.push(trimmed.toLowerCase());
    }
  }

  // Sort modifiers in a consistent order: Meta, Ctrl, Shift, Alt
  const sortedModifiers = modifiers.sort((a, b) => {
    const order = ["Meta", "Ctrl", "Shift", "Alt"];
    return order.indexOf(a) - order.indexOf(b);
  });

  return [...sortedModifiers, ...nonModifiers].join("+");
}

export function ShortcutsContextProvider({
  children,
}: ShortcutsContextProviderProps) {
  const registered = useRef(new Map<string, () => void>());

  const register = (sequence: string, callback: () => void) => {
    const normalizedSequence = normalizeSequence(sequence);
    if (registered.current.has(normalizedSequence)) {
      console.warn(`Sequence ${sequence} already exists as a shortcut`);
      return;
    }
    registered.current.set(normalizedSequence, callback);
  };

  const value = { register };

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const keys: string[] = [];

      // Meta key is Command on Mac (metaKey) and Ctrl on Windows (ctrlKey)
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      if ((isMac && event.metaKey) || (!isMac && event.ctrlKey)) {
        keys.push("Meta");
      }
      // On Mac, Ctrl is treated as a separate modifier
      if (isMac && event.ctrlKey) {
        keys.push("Ctrl");
      }
      if (event.shiftKey) {
        keys.push("Shift");
      }
      if (event.altKey) {
        keys.push("Alt");
      }

      // Add the main key if it's not a modifier
      if (!["Control", "Shift", "Alt", "Meta"].includes(event.key)) {
        keys.push(event.key.toLowerCase());
      }

      const sequence = keys.join("+");
      const normalizedSequence = normalizeSequence(sequence);
      const callback = registered.current.get(normalizedSequence);

      if (callback) {
        event.preventDefault();
        callback();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <ShortcutsContext.Provider value={value}>
      {children}
    </ShortcutsContext.Provider>
  );
}

export function useRegisterShortcut(sequence: string, callback: () => void) {
  const ref = useRef(callback);
  ref.current = callback;

  const { register } = useContext(ShortcutsContext);

  useEffect(() => {
    return register(sequence, () => ref.current());
  }, [register, sequence]);
}
