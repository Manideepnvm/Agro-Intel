import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Environment variables are automatically handled by Vite
  // No need to explicitly define them in the config
  server: {
    port: 3000,
    open: true
  }
});
