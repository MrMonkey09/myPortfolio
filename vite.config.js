import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      "@utilities": path.resolve(__dirname, "./src/utilities/"),
      // eslint-disable-next-line no-undef
      "@views": path.resolve(__dirname, "./src/views/"),
      // eslint-disable-next-line no-undef
      "@assets": path.resolve(__dirname, "./src/assets/"),
    },
  },
});
