import { createTheme } from '@mui/material/styles';

// Design tokens pulled from the Figma. 
export const figma = {
  pageBg: '#ffffff',
  cardBg: '#ffffff',
  cardBorder: '#a5d8ff', // light blue card outline
  buttonBg: '#f7f5fb', // lavender-white button / dietary tag
  selectedBg: '#f0f7ff', // light blue for selected/hover rows
  heading: '#4c5c68', // slate — section headings, titles, button (Offside)
  ink: '#252525', // primary body text
  muted: '#656565', // secondary text
  marker: '#252525', // dark circular food markers
  markerSelected: '#1976d2',
  buttonShadow: '4px 4px 2px 0px rgba(76,92,104,0.5)',
  bodyFont: "'Anaheim', sans-serif",
  headFont: "'Offside', sans-serif",
} as const;

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
});

export default theme;
