import { createTheme } from '@mui/material/styles';

// Georgia Tech colors. Update when the style guide arrives.
const theme = createTheme({
  palette: {
    primary: {
      main: '#B3A369', // GT Tech Gold
    },
    secondary: {
      main: '#003057', // GT Navy Blue
    },
  },
  typography: {
    fontFamily: '"Anaheim", sans-serif',

    h1: { fontFamily: '"Offside", sans-serif' },
    h2: { fontFamily: '"Offside", sans-serif' },
    h3: { fontFamily: '"Offside", sans-serif' },
    h4: { fontFamily: '"Offside", sans-serif' },
    h5: { fontFamily: '"Offside", sans-serif' },
    h6: { fontFamily: '"Offside", sans-serif' },
  },
});

export default theme;
