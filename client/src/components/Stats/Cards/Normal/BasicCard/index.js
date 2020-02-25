import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import cl from 'classnames';
import s from './index.module.css';
import DataDisplayer from '../../../DataDisplayer';

/*
* BasicChart is built on top of DataDisplayer,
* it implements the render logic for all type of charts
*/

class BasicCard extends DataDisplayer {
  fetchStats = () => {
    throw new Error('Implement fetchStats');
  }

  getTop = () => {
    throw new Error('Implement getTop');
  }

  getValue = () => {
    throw new Error('Implement getValue');
  }

  getBottom = () => {
    throw new Error('Implement getBottom');
  }

  isReady = () => {
    throw new Error('Implement isReady');
  }

  render() {
    const {
      className,
    } = this.props;

    if (!this.isReady()) return null;

    return (
      <Paper className={cl(s.root, className)}>
        <Typography variant="subtitle2" component="div">{this.getTop()}</Typography>
        <Typography className={s.middle} variant="h4">{this.getValue()}</Typography>
        <Typography component="div">{this.getBottom()}</Typography>
      </Paper>
    );
  }
}

export default BasicCard;
