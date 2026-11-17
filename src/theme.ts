import { createTheme } from '@mui/material/styles';

// Design tokens pulled from the Figma / Ethan's nav language.
export const figma = {
  pageBg: '#ffffff',
  cardBg: '#ffffff',
  cardBorder: '#a5d8ff', // light blue card outline
  buttonBg: '#f7f5fb', // lavender-white button / dietary tag
  selectedBg: '#f0f7ff', // light blue for selected/hover rows
  navBand: 'rgba(165,216,255,0.14)', // nav bar alternating blue band tint
  brandBlue: '#4a90d9', // darker blue for the "BUZZ" wordmark + primary actions
  heading: '#4c5c68', // slate — section headings, titles
  ink: '#252525', // primary body text
  muted: '#656565', // secondary text
  marker: '#252525', // dark circular food markers
  markerSelected: '#1976d2',
  buttonShadow: '4px 4px 2px 0px rgba(76,92,104,0.5)',
} as const;

//if ur trying to change fondts,
//change here and the link in index.html
export const fontStack = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const theme = createTheme({
  palette: {
    primary: {
      main: figma.brandBlue,
      light: '#7eb3e8',
      dark: '#2f6fad',
      contrastText: '#ffffff',
    },
    secondary: {
      main: figma.heading,
      contrastText: '#ffffff',
    },
    info: {
      main: figma.markerSelected,
    },
    background: {
      default: figma.pageBg,
      paper: figma.cardBg,
    },
    text: {
      primary: figma.ink,
      secondary: figma.muted,
    },
    divider: figma.cardBorder,
  },
  typography: {
    fontFamily: fontStack,
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          '&.MuiButton-containedPrimary': {
            backgroundColor: figma.brandBlue,
            color: '#ffffff',
            '&:hover': { backgroundColor: '#3b7fc4' },
          },
        },
        outlined: {
          '&.MuiButton-outlinedPrimary': {
            borderColor: figma.cardBorder,
            color: figma.brandBlue,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
              borderColor: figma.brandBlue,
              backgroundColor: figma.selectedBg,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        filled: {
          '&.MuiChip-colorPrimary': {
            backgroundColor: figma.brandBlue,
            color: '#ffffff',
          },
        },
        outlined: {
          borderColor: figma.cardBorder,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: figma.brandBlue,
            borderWidth: 2,
          },
        },
        notchedOutline: {
          borderColor: figma.cardBorder,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': { color: figma.brandBlue },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: {
          borderColor: figma.cardBorder,
        },
      },
    },
  },
});

export default theme;
