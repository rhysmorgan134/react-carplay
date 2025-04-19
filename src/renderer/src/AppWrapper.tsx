import React from 'react';
import App from './App';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import { useCarplayStore } from './store/store';

const AppWrapper: React.FC = () => {
  const settings = useCarplayStore(state => state.settings);
  const theme    = settings?.nightMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};

export default AppWrapper;