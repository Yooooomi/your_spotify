import { createTheme } from '@mui/material';

export default createTheme({
  palette: {
    primary: {
      main: '#000000',
    },
  },
  components: {
    MuiSkeleton: {
      styleOverrides: {
        rectangular: {
          borderRadius: '6px',
        },
      },
    },
  },
  shape: {
    borderRadius: 6,
  },
});
