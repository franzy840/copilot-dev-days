import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Auto-detect base path when built for the GitHub Pages preview (GitHub
  // Actions sets VITE_REPO_NAME). The real Vercel deployment doesn't set
  // this, so it stays at the default '/'.
  base: process.env.VITE_REPO_NAME ? `/${process.env.VITE_REPO_NAME}/work-experience/` : '/',
});
