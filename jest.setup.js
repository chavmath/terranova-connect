import '@testing-library/jest-dom';
// Añadir soporte para TextEncoder en entornos de prueba de Node.js
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;