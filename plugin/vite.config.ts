/* eslint-disable import/no-extraneous-dependencies */
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '',
  build: {
    outDir: 'build',
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      name: 'voiceflow-webchat-plugin',
      fileName: 'bundle',
      formats: ['es'],
    },
  },
  plugins: [react()],
});
