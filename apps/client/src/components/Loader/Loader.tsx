import { CircularProgress } from "@mui/material";
import clsx from "clsx";
import { HTMLProps } from "../../services/types";
import Text from "../Text";
import s from "./index.module.css";

interface LoaderProps extends HTMLProps<"div"> {
  text?: string;
}

export default function Loader({ text, className, ...other }: LoaderProps) {
  return (
    <div className={clsx(s.root, className)} {...other}>
      <CircularProgress size={24} />
      {text && (
        <Text element="div" className={s.text}>
          {text}
        </Text>
      )}
    </div>
  );
}
