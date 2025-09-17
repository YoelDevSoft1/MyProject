// ========================================
// MUI THEME PROVIDER PARA SMD VITAL
// ========================================

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { medicalTheme } from './medicalTheme';
import { horizonTheme } from './HorizonTheme';
import { horizonMedicalTheme } from '../components/horizon/HorizonMedicalTheme';

interface MUIProviderProps {
  children: React.ReactNode;
}

export const MUIProvider: React.FC<MUIProviderProps> = ({ children }) => {
  return (
    <ThemeProvider theme={horizonMedicalTheme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  );
};
