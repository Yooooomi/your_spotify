import React from 'react';
import Text from '../../../components/Text';
import s from './index.module.css';

interface SettingLineProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export default function SettingLine({ left, right }: SettingLineProps) {
  return (
    <div className={s.root}>
      <Text element="strong">{left}</Text>
      <Text>{right}</Text>
    </div>
  );
}
