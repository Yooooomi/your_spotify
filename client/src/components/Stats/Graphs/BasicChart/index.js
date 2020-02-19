import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import cl from 'classnames';
import s from './index.module.css';
import DataDisplayer from '../../DataDisplayer';

/*
* BasicChart is built on top of DataDisplayer,
* it implements the refresh logic for all type of charts
* it implements the render logic for all type of charts
*/

class BasicChart extends DataDisplayer {
  fetchStats = async () => {
    throw new Error('Implement fetch stats');
  }

  postRefreshModification = (data) => {
    return data;
  }

  refresh = async (cb) => {
    const data = await this.fetchStats();
    const values = await this.postRefreshModification(data);

    this.setState({
      stats: values,
    }, cb);
  }

  setInfos = (field, value, shouldRefresh = true) => {
    this.setState({ [field]: value }, () => {
      if (!shouldRefresh) return;
      this.refresh();
    });
  }

  getContent = () => {
    throw new Error('Implement get content');
  }

  render() {
    const { className } = this.props;
    const { stats } = this.state;

    return (
      <Paper className={cl(s.paper, className)}>
        <Typography variant="subtitle2">{this.name}</Typography>
        {!stats ? <Typography color="error">No content</Typography> : this.getContent()}
      </Paper>
    );
  }
}

export default BasicChart;
