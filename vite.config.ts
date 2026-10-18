import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  optimizeDeps: {
    entries: ["index.html"],
  },
  server: {
    // Optional AI server (server/). Without it the app runs in offline demo mode.
    proxy: {
      "/api": "http://127.0.0.1:3000",
    },
  },
});
