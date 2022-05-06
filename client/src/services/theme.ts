import { createTheme, useMediaQuery } from '@mui/material';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectDarkMode } from './redux/modules/user/selector';

export const useTheme = () => {
  const dark = useSelector(selectDarkMode);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const isDark = dark === 'dark' || (dark === 'follow' && prefersDarkMode);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? 'dark' : 'light',
          primary: {
            main: isDark ? '#ffffff' : '#000000',
          },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'unset',
              },
            },
          },
          MuiCheckbox: {
            styleOverrides: {
              root: {
                color: 'var(--primary) !important',
              },
            },
          },
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
      }),
    [isDark],
  );
  return theme;
};
