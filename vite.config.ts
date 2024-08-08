import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// const targetURL = process.env.NODE_ENV === "development"
//   ? "http://localhost:4000"
//   : "https://progressive-chat-app.onrender.com";
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "https://progressive-chat-app.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
