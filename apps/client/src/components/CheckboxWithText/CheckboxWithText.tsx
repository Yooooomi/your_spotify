import { Checkbox } from "@mui/material";
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
  const internOnChange = () => {
    onChecked(!checked);
  };

  return (
    <div
      className={s.root}
      role="checkbox"
      tabIndex={0}
      aria-checked={checked}
      onClick={internOnChange}>
      <Checkbox checked={checked} />
      <Text size="normal">{text}</Text>
    </div>
  );
}
