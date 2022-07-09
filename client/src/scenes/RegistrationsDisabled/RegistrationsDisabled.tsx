import React from 'react';
import Text from '../../components/Text';
import s from './index.module.css';

export default function RegistrationsDisabled() {
  return (
    <div className={s.root}>
      <Text element="h1">Registrations are disabled</Text>
      <Text className={s.explain}>
        Cannot register any new account for the moment. Any admin account on
        this installation can enable the registrations back.
      </Text>
    </div>
  );
}
