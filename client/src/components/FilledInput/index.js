import React from 'react';
import s from './index.module.css';

function FilledInput({ ...other }) {
  return (
    <input className={s.root} {...other} />
  );
}

export default FilledInput;
