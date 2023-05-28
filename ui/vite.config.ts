import solidPlugin from 'vite-plugin-solid';
import { defineConfig } from "vite";
import solidStyled from "vite-plugin-solid-styled";

export default defineConfig({
  plugins: [
    solidPlugin(),
    solidStyled({
      filter: {
        include: "src/**/*.tsx",
        exclude: "node_modules/**/*.{ts,js}",
      },
    }),
  ],
  server : {
    port: 3000
  },
  build: {
    target: 'esnext',
  },
});
