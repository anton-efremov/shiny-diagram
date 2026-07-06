import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "webview",
  base: "./",
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "src/test/setup.ts",
    include: ["src/**/*.test.{ts,tsx}"],
  },
  build: {
    outDir: "../out/webview",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "assets/index.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
