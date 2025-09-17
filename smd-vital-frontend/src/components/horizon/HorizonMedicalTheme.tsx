// ========================================
// HORIZON UI MEDICAL THEME PARA SMD VITAL
// ========================================

import { createTheme } from '@mui/material/styles';

// Colores médicos inspirados en Horizon UI
const medicalColors = {
  brand: {
    50: '#E9E3FF',
    100: '#E9E3FF',
    200: '#422AFB',
    300: '#422AFB',
    400: '#7551FF',
    500: '#422AFB',
    600: '#3311DB',
    700: '#02044A',
    800: '#190793',
    900: '#11047A',
  },
  secondaryGray: {
    50: '#FAFCFE',
    100: '#E0E5F2',
    200: '#E1E9F8',
    300: '#F4F7FE',
    400: '#E9EDF7',
    500: '#8F9BBA',
    600: '#A3AED0',
    700: '#707EAE',
    800: '#707EAE',
    900: '#1B2559',
  },
  medical: {
    primary: '#422AFB',
    secondary: '#7551FF',
    success: '#01B574',
    warning: '#FFB547',
    error: '#EE5D50',
    info: '#3965FF',
    navy: '#1B254B',
    gray: '#8F9BBA',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #422AFB 0%, #7551FF 100%)',
    secondary: 'linear-gradient(135deg, #7551FF 0%, #422AFB 100%)',
    success: 'linear-gradient(135deg, #01B574 0%, #00A86B 100%)',
    warning: 'linear-gradient(135deg, #FFB547 0%, #FFA726 100%)',
    error: 'linear-gradient(135deg, #EE5D50 0%, #F44336 100%)',
    info: 'linear-gradient(135deg, #3965FF 0%, #2196F3 100%)',
  },
};

export const horizonMedicalTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: medicalColors.medical.primary,
      light: medicalColors.brand[400],
      dark: medicalColors.brand[700],
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: medicalColors.medical.secondary,
      light: medicalColors.brand[300],
      dark: medicalColors.brand[800],
      contrastText: '#FFFFFF',
    },
    success: {
      main: medicalColors.medical.success,
      light: '#E6FAF5',
      dark: '#00A86B',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: medicalColors.medical.warning,
      light: '#FFF6DA',
      dark: '#FFA726',
      contrastText: '#FFFFFF',
    },
    error: {
      main: medicalColors.medical.error,
      light: '#FEEFEE',
      dark: '#E31A1A',
      contrastText: '#FFFFFF',
    },
    info: {
      main: medicalColors.medical.info,
      light: '#EFF4FB',
      dark: '#1976D2',
      contrastText: '#FFFFFF',
    },
    background: {
      default: medicalColors.secondaryGray[300],
      paper: '#FFFFFF',
    },
    text: {
      primary: medicalColors.secondaryGray[900],
      secondary: medicalColors.secondaryGray[600],
    },
    grey: {
      50: medicalColors.secondaryGray[50],
      100: medicalColors.secondaryGray[100],
      200: medicalColors.secondaryGray[200],
      300: medicalColors.secondaryGray[300],
      400: medicalColors.secondaryGray[400],
      500: medicalColors.secondaryGray[500],
      600: medicalColors.secondaryGray[600],
      700: medicalColors.secondaryGray[700],
      800: medicalColors.secondaryGray[800],
      900: medicalColors.secondaryGray[900],
    },
  },
  typography: {
    fontFamily: '"DM Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.5px',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.5px',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.5px',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.5px',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.5px',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.5px',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '-0.5px',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '-0.5px',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '-0.5px',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '-0.5px',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.12)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.16)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.20)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.24)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.28)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.32)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.36)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.40)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.44)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.48)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.52)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.56)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.60)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.64)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.68)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.72)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.76)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.80)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.84)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.88)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: '12px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          letterSpacing: '-0.5px',
          transition: 'all 0.2s linear',
          '&:hover': {
            boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          background: medicalColors.gradients.primary,
          '&:hover': {
            background: medicalColors.gradients.secondary,
          },
        },
        outlined: {
          borderColor: medicalColors.medical.primary,
          color: medicalColors.medical.primary,
          '&:hover': {
            backgroundColor: medicalColors.brand[50],
            borderColor: medicalColors.brand[400],
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
          border: 'none',
          transition: 'all 0.2s linear',
          '&:hover': {
            boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.12)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
          fontSize: '0.75rem',
          letterSpacing: '-0.5px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            backgroundColor: '#FFFFFF',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: medicalColors.brand[400],
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: medicalColors.medical.primary,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: medicalColors.secondaryGray[900],
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: 'none',
          boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 8px',
          '&:hover': {
            backgroundColor: medicalColors.brand[50],
            color: medicalColors.medical.primary,
          },
          '&.Mui-selected': {
            backgroundColor: medicalColors.brand[100],
            color: medicalColors.medical.primary,
            '&:hover': {
              backgroundColor: medicalColors.brand[200],
            },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 8,
          borderRadius: 4,
          backgroundColor: medicalColors.secondaryGray[200],
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
  },
});

export default horizonMedicalTheme;
