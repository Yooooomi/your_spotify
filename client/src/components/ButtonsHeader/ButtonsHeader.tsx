import { Tab, Tabs } from '@mui/material';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Text from '../Text';
import s from './index.module.css';

export interface ButtonsHeaderItem {
  label: string;
  url: string;
}

interface ButtonsHeaderProps {
  items: ButtonsHeaderItem[];
}

export default function ButtonsHeader({ items }: ButtonsHeaderProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  const goto = useCallback(
    (value: number) => {
      navigate(items[value].url);
      setTab(value);
    },
    [items, navigate],
  );

  return (
    <Tabs value={tab} onChange={(_, v) => goto(v)} textColor="secondary">
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
