import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './assets/css/App.css';

import App from './App';

// Suprimir advertencias específicas de Emotion y source maps
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  // Suprimir advertencias específicas de Emotion sobre kebab-case
  const message = args[0];
  if (message && typeof message === 'string' && 
      (message.includes('Using kebab-case for css properties in objects is not supported') ||
       message.includes('Did you mean &:hover, &[dataHover]?') ||
       message.includes('Failed to parse source map from') ||
       message.includes('stylis-plugin-rtl'))) {
    return;
  }
  // Mostrar otras advertencias normalmente
  originalConsoleWarn.apply(console, args);
};

// También suprimir advertencias de Emotion en el objeto global
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0];
    if (message && typeof message === 'string' && 
        message.includes('Using kebab-case for css properties in objects is not supported')) {
      return;
    }
    originalError.apply(console, args);
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}
  >
    <App />
  </BrowserRouter>,
);
