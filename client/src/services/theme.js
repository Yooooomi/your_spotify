import { createTheme } from '@material-ui/core';

export const mobileThreshold = '960px';
export const lessThanMobile = `(max-width:${mobileThreshold})`;
export const moreThanMobile = `(min-width:${mobileThreshold})`;

export const tabletThreshold = '1600px';
export const lessThanTablet = `(max-width:${tabletThreshold})`;
export const moreThanTablet = `(min-width:${tabletThreshold})`;

const shadows = [
  '0 0px 1.4px rgba(0, 0, 0, 0.011)',
  '0 0px 3.5px rgba(0, 0, 0, 0.016)',
  '0 0px 6.5px rgba(0, 0, 0, 0.02)',
  '0 0px 11.6px rgba(0, 0, 0, 0.024)',
  '0 0px 21.7px rgba(0, 0, 0, 0.029)',
  '0 0px 52px rgba(0, 0, 0, 0.04)',
].join(',');

const theme = createTheme({
  shape: {
    borderRadius: '0.25rem',
  },
  palette: {
    primary: { main: '#1365ff' },
    secondary: { main: '#EBECF0' },
    success: { main: '#255E2B' },
    error: { main: '#A90202' },
  },
  typography: {
    fontFamily: 'Roboto',
    fontWeightBold: 'lighter',
    subtitle1: {
      color: 'grey',
    },
    subtitle2: {
      fontWeight: 'bold',
    },
    allVariants: {
      fontWeight: 'normal',
      margin: '0px',
      padding: '0px',
    },
    fontWeightRegular: 'normal',
  },
  shadows: Array.from(Array(25).keys()).map(() => shadows),
  props: {
    MuiSelect: {
      disableUnderline: true,
    },
    MuiTab: {
      disableRipple: true,
    },
  },
  overrides: {
    MuiButton: {
      root: {
        textTransform: 'capitalize',
      },
    },
    MuiSelect: {
      selectMenu: {
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        minHeight: '44px',
        borderRadius: '10px !important',
        backgroundColor: 'white !important',
        'box-shadow': '0 0 14px 0 rgba(53,64,82,.05)',
        border: 'none',
      },
    },
    MuiToggleButtonGroup: {
      root: {
        backgroundColor: 'white',
        'box-shadow': '0 0 14px 0 rgba(53,64,82,.05)',
        border: 'none',
      },
    },
    MuiToggleButton: {
      root: {
        border: 'none',
      },
    },
    MuiFilledInput: {
      root: {
        backgroundColor: '#efefef',
      },
    },
    MuiTabs: {
      root: {
        'box-shadow': '0 0 14px 0 rgba(53,64,82,.05)',
        backgroundColor: 'white',
        borderRadius: '10px',
        minHeight: 44,
      },
      flexContainer: {
        position: 'relative',
        padding: '0 3px',
        zIndex: 1,
      },
      indicator: {
        top: 3,
        bottom: 3,
        right: 3,
        height: 'auto',
        borderRadius: 8,
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 12px 0 rgba(0,0,0,0.16)',
      },
    },
  },
});

theme.overrides.MuiTab = {
  root: {
    '&:hover': {
      opacity: 1,
    },
    minHeight: 44,
    minWidth: 96,
    [theme.breakpoints.up('md')]: {
      minWidth: 120,
    },
  },
  wrapper: {
    // zIndex: 2,
    // marginTop: spacing(0.5),
    color: theme.palette.text.primary,
    textTransform: 'initial',
  },
};

export default theme;
