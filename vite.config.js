import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Permite acceder desde cualquier dirección de red
    open: true         // Abre el navegador automáticamente en localhost
  },
   base: '/',
})
