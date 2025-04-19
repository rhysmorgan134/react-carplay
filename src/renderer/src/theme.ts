import { createTheme } from "@mui/material/styles"
import { themeColors } from "./themeColors"

const commonLayout = {
  "html, body, #root": {
    margin: 0,
    padding: 0,
    height: "100%",
    width: "100%",
    overflow: "hidden",
    backgroundColor: "inherit",
  },
  "::-webkit-scrollbar": { display: "none" },
  ".App": {
    backgroundColor: "inherit",
  },
}

// Common Tab bar overrides
const commonTabs = {
  MuiTabs: {
    styleOverrides: {
      root: {
        position: "sticky",
        top: 0,
        zIndex: 1200,
        width: "100%",
        boxSizing: "border-box",
        color: "inherit",
      },
      indicator: { backgroundColor: "inherit" },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        minHeight: 64,
        color: "inherit",
        "& svg": { color: "inherit", fontSize: "36px" },
        "&.Mui-selected svg": { color: "inherit" },
      },
    },
  },
}

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: { default: themeColors.light, paper: themeColors.light },
    text: { primary: themeColors.textPrimaryLight, secondary: themeColors.textSecondaryLight },
    primary: { main: themeColors.highlightLight },
    divider: themeColors.dividerLight,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ...commonLayout,
        body: { backgroundColor: themeColors.light },
        ".app-wrapper, .App, #main, #videoContainer, .PhoneContent, .InfoContent, .CarplayContent": {
          backgroundColor: themeColors.light,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { backgroundColor: themeColors.light },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: themeColors.highlightLight,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: themeColors.highlightLight,
          },
        },
        notchedOutline: {
          borderColor: themeColors.dividerLight,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            color: themeColors.highlightLight,
          },
        },
      },
    },
    ...commonTabs,
  },
})
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: themeColors.dark, paper: themeColors.dark },
    text: { primary: themeColors.textPrimaryDark, secondary: themeColors.textSecondaryDark },
    primary: { main: themeColors.highlightDark },
    divider: themeColors.dividerDark,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ...commonLayout,
        body: { backgroundColor: themeColors.dark },
        ".app-wrapper, .App, #main, #videoContainer, .PhoneContent, .InfoContent, .CarplayContent": {
          backgroundColor: themeColors.dark,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { backgroundColor: themeColors.dark },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: themeColors.highlightDark,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: themeColors.highlightDark,
          },
        },
        notchedOutline: {
          borderColor: themeColors.dividerDark,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            color: themeColors.highlightDark,
          },
        },
      },
    },
    ...commonTabs,
  },
})
