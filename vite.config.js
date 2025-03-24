// import path from "path";
// import tailwindcss from "@tailwindcss/vite";
// // import react from "@vitejs/plugin-react";
// import { defineConfig } from "vite";
// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [tailwindcss()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// });
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react"; // ✅ Import plugin React
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()], // ✅ Thêm react() vào plugins
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
