import { Checkbox } from "@mui/material";
import { useCallback } from "react";
import Text from "../Text";
import s from "./index.module.css";

interface CheckboxWithTextProps {
  text: string;
  checked: boolean;
  onChecked: (newValue: boolean) => void;
}

export default function CheckboxWithText({
  text,
  checked,
  onChecked,
}: CheckboxWithTextProps) {
  const internOnChange = useCallback(() => {
    onChecked(!checked);
  }, [checked, onChecked]);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      className={s.root}
      role="checkbox"
      tabIndex={0}
      aria-checked={checked}
      onClick={internOnChange}>
      <Checkbox checked={checked} />
      <Text>{text}</Text>
    </div>
  );
}
