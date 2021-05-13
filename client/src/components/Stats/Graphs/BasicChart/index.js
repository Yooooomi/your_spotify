import React from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Typography,
} from '@material-ui/core';
import cl from 'classnames';
import FullscreenIcon from '@material-ui/icons/ZoomIn';
import s from './index.module.css';
import DataDisplayer from '../../DataDisplayer';

/*
* BasicChart is built on top of DataDisplayer,
* it implements the refresh logic for all type of charts
* it implements the render logic for all type of charts
*/

class BasicChart extends DataDisplayer {
  constructor(...args) {
    super(...args);
    this.state.dialog = false;
    this.dialogRef = React.createRef();
  }

  getWidth = () => {
    const rf = this.state.dialog ? this.dialogRef : this.myRef;
    if (rf && rf.current) {
      return rf.current.clientWidth;
    }
    return -1;
  }

  fetchStats = async () => {
    throw new Error('Implement fetch stats');
  }

  postRefreshModification = (data) => data

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

  handleDialog = state => () => {
    this.setState({ dialog: state }, () => {
      this.onresize();
    });
  }

  render() {
    const { className } = this.props;
    const { stats, dialog } = this.state;

    const content = !stats ? <Typography color="error">No content</Typography> : this.getContent();

    return (
      <Paper className={cl(s.paper, className)} ref={this.myRef}>
        <Dialog
          onClose={this.handleDialog(false)}
          open={dialog}
          maxWidth="lg"
          fullWidth
        >
          <DialogContent>
            <div ref={this.dialogRef} className={s.dialogcontainer}>
              <Typography variant="subtitle2">{this.name}</Typography>
              {content}
            </div>
          </DialogContent>
        </Dialog>
        <div className={s.header}>
          <Typography variant="subtitle2">{this.name}</Typography>
          <IconButton onClick={this.handleDialog(true)} size="small">
            <FullscreenIcon fontSize="small" />
          </IconButton>
        </div>
        {content}
      </Paper>
    );
  }
}

export default BasicChart;
