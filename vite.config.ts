/** Configuración de Vite: integra React, Tailwind y la compilación de GLB. */
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.glb'],
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
