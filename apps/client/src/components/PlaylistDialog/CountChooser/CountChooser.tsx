import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Input,
} from "@mui/material";
import { useCallback, useState } from "react";
import s from "./index.module.css";

interface CountChooserProps {
  value: number;
  setValue: (newNumber: number) => void;
}

const DEFAULT_CHOICES = [10, 25, 50, 100];

export default function CountChooser({ value, setValue }: CountChooserProps) {
  const [inputType, setInputType] = useState<"default" | "custom">("default");

  const internSetValue = useCallback(
    (newValue: string | number, fromSelect = false) => {
      if (newValue === "custom") {
        setInputType("custom");
      } else {
        if (fromSelect) {
          setInputType("default");
        }
        if (typeof newValue === "string") {
          setValue(+newValue.slice(0, 10));
        } else if (typeof newValue === "number") {
          setValue(newValue);
        }
      }
    },
    [setValue],
  );

  return (
    <>
      <FormControl fullWidth className={s.numberSelect}>
        <InputLabel id="number">Number of items</InputLabel>
        <Select
          labelId="number"
          label="Number of items"
          displayEmpty
          value={inputType === "default" ? value.toString() : "custom"}
          onChange={ev => internSetValue(ev.target.value, true)}>
          {DEFAULT_CHOICES.map(choice => (
            <MenuItem key={choice} value={choice}>
              {choice}
            </MenuItem>
          ))}
          <MenuItem value="custom">Custom</MenuItem>
        </Select>
      </FormControl>
      {inputType === "custom" && (
        <Input
          className={s.input}
          datatype="number"
          placeholder="Custom amount"
          fullWidth
          value={value.toString()}
          onChange={ev => internSetValue(ev.target.value)}
        />
      )}
    </>
  );
}
