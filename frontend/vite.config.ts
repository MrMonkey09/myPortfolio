import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        educacion: path.resolve(__dirname, "educacion.html"),
        habilidades: path.resolve(__dirname, "habilidades.html"),
        contacto: path.resolve(__dirname, "contacto.html"),
        servicios: path.resolve(__dirname, "servicios.html"),
      },
    },
  },
resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/"),
      "@utilities": path.resolve(__dirname, "./src/utilities/"),
      "@views": path.resolve(__dirname, "./src/views/"),
      "@assets": path.resolve(__dirname, "./src/assets/"),
      "@hooks": path.resolve(__dirname, "./src/hooks/"),
    },
  },
});
