import React from 'react';
import { Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

class SnackbarMessage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      severity: '',
      msg: '',
    };
  }

  componentDidMount() {
    window.message = this.setMessage;
  }

  setMessage = (severity, msg) => {
    this.setState({
      open: true,
      severity,
      msg,
    });
  }

  setOpen = status => (ev, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({
      open: status,
    });
  }

  render() {
    const { open, severity, msg } = this.state;

    return (
      <div>
        <Snackbar
          anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
          open={open}
          autoHideDuration={3000}
          onClose={this.setOpen(false)}
        >
          <Alert
            variant="filled"
            severity={severity}
            onClose={this.setOpen(false)}
          >
            {msg}
          </Alert>
        </Snackbar>
      </div>
    );
  }
}

export default SnackbarMessage;
