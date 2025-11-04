// Configuración para suprimir warnings de source maps de terceros
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Suprimir warnings de source maps
  const originalWarn = console.warn;
  console.warn = function(message) {
    if (message && message.includes && message.includes('stylis-plugin-rtl')) {
      return;
    }
    originalWarn.apply(console, arguments);
  };
};
