import {
  createContext,
  MouseEvent,
  ReactNode,
  useContext,
} from "react";
import clsx from "clsx";
import { uniq } from "../../services/tools";
import { Pointer } from "../../services/pointer";
import s from "./index.module.css";

function hasAdditiveSelectKeyPressed(ctrlKey: boolean, metaKey: boolean) {
  const isMac = /mac/i.test(navigator.platform);
  if (isMac) {
    return metaKey;
  }
  return ctrlKey;
}

type EraseType = "yes" | "no" | "ifnotselected";

interface SelectableContext {
  selected: number[];
  select: (index: number, erase: EraseType) => void;
  selectTo: (index: number) => void;
}

export const SelectableContext = createContext<SelectableContext>({
  selected: [],
  select: () => { },
  selectTo: () => { },
});

interface SelectableContextProviderProps {
  children: ReactNode;
  selected: number[];
  setSelected: (selected: number[]) => void;
}

export const SelectableContextProvider = ({
  children,
  selected,
  setSelected,
}: SelectableContextProviderProps) => {
  const handleSelect = (index: number, erase: EraseType) => {
    if (erase === "yes") {
      setSelected([index]);
    } else if (erase === "no") {
      setSelected(uniq([...selected, index]));
    } else if (erase === "ifnotselected") {
      const isSelected = selected.indexOf(index) !== -1;
      if (!isSelected) {
        setSelected([index]);
      }
    }
  };

  const handleSelectTo = (index: number) => {
    const lastSelected = selected.at(-1);
    if (lastSelected === undefined) {
      setSelected([index]);
      return;
    }
    const order = Math.sign(index - lastSelected);
    console.log(order);
    const addedIndexes: number[] = [];
    for (
      let i = lastSelected;
      order < 0 ? i >= index : i <= index;
      i += order
    ) {
      addedIndexes.push(i);
    }
    setSelected(uniq([...selected, ...addedIndexes]));
  };

  return (
    <SelectableContext.Provider
      value={{ selected, select: handleSelect, selectTo: handleSelectTo }}>
      {children}
    </SelectableContext.Provider>
  );
};

interface SelectableProps {
  index: number;
  children: ReactNode;
}

export const Selectable = ({ children, index }: SelectableProps) => {
  const { selected, select, selectTo } = useContext(SelectableContext);

  const handleClick = (event: MouseEvent) => {
    if (Pointer.type !== "mouse") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    if (event.shiftKey) {
      selectTo(index);
    } else {
      select(
        index,
        hasAdditiveSelectKeyPressed(event.ctrlKey, event.metaKey)
          ? "no"
          : "yes",
      );
    }
  };

  return (
    <div
      className={clsx(s.root, selected.indexOf(index) !== -1 && s.selected)}
      onClick={handleClick}>
      {children}
    </div>
  );
};
