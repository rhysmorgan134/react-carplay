import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useCarplayStore } from './store/store';
import { darkTheme, lightTheme, initCursorHider } from './theme';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

initCursorHider();

const Root = () => {
  const settings = useCarplayStore(state => state.settings);
  const theme = settings ? (settings.nightMode ? darkTheme : lightTheme) : darkTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Root />
);

