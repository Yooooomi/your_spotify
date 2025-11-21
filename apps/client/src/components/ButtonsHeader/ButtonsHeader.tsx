import { Tab, Tabs } from "@mui/material";
import { useLocation } from "react-router-dom";
import Text from "../Text";
import { useNavigate } from "../../services/hooks/useNavigate";
import s from "./index.module.css";

export interface ButtonsHeaderItem {
  label: string;
  url: string;
}

interface ButtonsHeaderProps {
  items: ButtonsHeaderItem[];
}

export default function ButtonsHeader({ items }: ButtonsHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const tab = (() => {
    const currentTab = items.findIndex(item =>
      location.pathname.startsWith(item.url),
    );
    if (currentTab !== -1) {
      return currentTab;
    }
    return items[0];
  })();

  const goto = (value: number) => {
      const url = items[value];
      if (!url) {
        return;
      }
      navigate(url.url);
    };

  return (
    <Tabs
      value={tab}
      onChange={(_, v) => goto(v)}
      textColor="secondary"
      className={s.tabs}>
      {items.map((item, k) => (
        <Tab
          className={s.item}
          key={item.url}
          label={<Text size="normal">{item.label}</Text>}
          value={k}
          role="link"
        />
      ))}
    </Tabs>
  );
}
