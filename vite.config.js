import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// GitHub Pages sirve el sitio en /fitness-app/
export default defineConfig({
  base: '/fitness-app/',
  plugins: [preact()],
});
