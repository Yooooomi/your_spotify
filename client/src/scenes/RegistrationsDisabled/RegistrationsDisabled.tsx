import React from 'react';
import s from './index.module.css';

export default function RegistrationsDisabled() {
  return (
    <div className={s.root}>
      <h1>Registrations are disabled</h1>
      <span className={s.explain}>
        Cannot register any new account for the moment. Any admin account on this installation can
        enable the registrations back.
      </span>
    </div>
  );
}
