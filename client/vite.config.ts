import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",                        // importante per Railway sub-path
  build: {
    rollupOptions: { output: { manualChunks: false } } // 1 bundle
  }
});
