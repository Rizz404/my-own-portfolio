import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import Icons from "unplugin-icons/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), vue(), vueDevTools(), Icons({ compiler: "vue3" })],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    // * Mirror rewrite /api/v1 di vercel.json biar VITE_API_BASE_URL=/api/v1 juga jalan pas `vite dev`
    // ! hapus kalo semisal udah ganti backend
    proxy: {
      "/api/v1": {
        target: "http://31.97.109.89:8001",
        changeOrigin: true,
      },
    },
  },
});
