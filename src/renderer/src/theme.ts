import { createTheme } from "@mui/material/styles";

const commonLayout = {
  body: {
    margin: 0,
    padding: 0,
    overflowX: 'hidden',
    scrollbarWidth: 'none',
  },
  '::-webkit-scrollbar': { display: 'none' },
  '.App': {
    textAlign: 'center',
    border: 'none',
    outline: 'none',
    width: '100%',
    maxWidth: '100vw',
    overflowX: 'hidden',
  },
  '.App-logo': {
    height: '40vmin',
    pointerEvents: 'none',
    animation: 'App-logo-spin infinite 20s linear',
  },
  '@keyframes App-logo-spin': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  '.App-link': {
    color: '#61dafb',
    textDecoration: 'none',
  },
};

const commonHeader = {
  width: '100%',
  padding: '16px',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 'calc(10px + 2vmin)',
  textAlign: 'center',
};

const commonTabs = {
  MuiTabs: {
    styleOverrides: {
      root: {
        position: 'sticky',
        top: 0,
        zIndex: 1200,
        backgroundColor: 'inherit',
        width: '100%',
        boxSizing: 'border-box',
        color: 'inherit',
      },
      indicator: { backgroundColor: '#61dafb' },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        minHeight: 64,
        color: 'inherit',
        '& svg': { color: 'inherit', fontSize: '36px' },
        '&.Mui-selected svg': { color: '#61dafb' },
      },
    },
  },
};

const inputOverrides = {
  MuiInputBase: {
    styleOverrides: { input: { color: 'inherit' } }
  },
  MuiOutlinedInput: {
    styleOverrides: {
      notchedOutline: { borderColor: 'inherit' },
      root: {
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#61dafb' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#61dafb' },
      },
    },
  },
  MuiInputLabel: {
    styleOverrides: { root: { color: 'inherit' } }
  },
  MuiFormControlLabel: {
    styleOverrides: { label: { color: 'inherit' } }
  },
  MuiFormLabel: {
    styleOverrides: { root: { color: 'inherit' } }
  },
  MuiCheckbox: {
    styleOverrides: { root: { color: 'inherit' } }
  },
  MuiRadio: {
    styleOverrides: { root: { color: 'inherit' } }
  },
  MuiButton: {
    styleOverrides: {
      root: {
        color: 'inherit',
        '&:hover': { backgroundColor: 'rgba(97,218,251,0.1)' },
      },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: { default: '#ffffff', paper: '#ffffff' },
    text: { primary: '#000000', secondary: '#333333' },
    primary: { main: '#61dafb' },
    divider: '#cccccc',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ...commonLayout,
        body: { ...commonLayout.body, backgroundColor: '#ffffff', color: '#000000' },
        '.App': { ...commonLayout['.App'], backgroundColor: '#ffffff', color: '#000000' },
        '.App-header-light': { ...commonHeader, backgroundColor: '#ffffff', color: '#000000' },
      },
    },
    ...commonTabs,
    ...inputOverrides,
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#000000', paper: '#1c1e24' },
    text: { primary: '#ffffff', secondary: '#bbbbbb' },
    primary: { main: '#61dafb' },
    divider: '#444444',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ...commonLayout,
        body: { ...commonLayout.body, backgroundColor: '#000000', color: '#ffffff' },
        '.App': { ...commonLayout['.App'], backgroundColor: '#000000', color: '#ffffff' },
        '.App-header-dark': { ...commonHeader, backgroundColor: '#000000', color: '#ffffff' },
      },
    },
    ...commonTabs,
    ...inputOverrides,
  },
});