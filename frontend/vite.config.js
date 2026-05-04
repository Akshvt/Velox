import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@layouts": path.resolve(__dirname, "./src/layouts"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@routes": path.resolve(__dirname, "./src/routes"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@api": path.resolve(__dirname, "./src/api"),
      "@mocks": path.resolve(__dirname, "./src/mocks"),
      "@realtime": path.resolve(__dirname, "./src/realtime"),
    },
  },
  server: {
    port: 5173,
    open: false,
    proxy: {
      "/api": {
        target: process.env.VITE_API_TARGET || "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: process.env.VITE_API_TARGET || "http://localhost:5000",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
