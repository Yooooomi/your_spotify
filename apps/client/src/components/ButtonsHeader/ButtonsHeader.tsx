import { Tab, Tabs } from "@mui/material";
import { useCallback, useMemo } from "react";
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

  const tab = useMemo(() => {
    const currentTab = items.findIndex(item =>
      location.pathname.startsWith(item.url),
    );
    if (currentTab !== -1) {
      return currentTab;
    }
    return items[0];
  }, [items, location.pathname]);

  const goto = useCallback(
    (value: number) => {
      const url = items[value];
      if (!url) {
        return;
      }
      navigate(url.url);
    },
    [items, navigate],
  );

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
          label={<Text>{item.label}</Text>}
          value={k}
          role="link"
        />
      ))}
    </Tabs>
  );
}
