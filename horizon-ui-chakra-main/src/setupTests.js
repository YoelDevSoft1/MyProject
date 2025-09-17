// SMD VITAL - Setup Tests
// Configuración para suprimir advertencias de desarrollo

// Suprimir advertencias específicas de Emotion
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  // Suprimir advertencias específicas de Emotion sobre kebab-case
  if (args[0] && typeof args[0] === 'string' && 
      args[0].includes('Using kebab-case for css properties in objects is not supported')) {
    return;
  }
  // Mostrar otras advertencias normalmente
  originalConsoleWarn.apply(console, args);
};

// Configuración adicional para tests
import '@testing-library/jest-dom';
