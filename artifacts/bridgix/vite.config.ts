import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT ?? "20154";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";
const host = process.env.HOST ?? "0.0.0.0";
const apiTarget = process.env.API_TARGET ?? "http://127.0.0.1:8080";
const isReplitRuntime = Boolean(
  process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID &&
    process.env.REPL_SLUG &&
    process.env.REPL_OWNER,
);

const cartographerPlugin = isReplitRuntime
  ? await (async () => {
      try {
        const mod = await import("@replit/vite-plugin-cartographer");
        return mod.cartographer({
          root: path.resolve(import.meta.dirname, ".."),
        });
      } catch (error) {
        console.warn("Skipping Replit cartographer plugin:", error);
        return null;
      }
    })()
  : null;

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    ...(isReplitRuntime ? [runtimeErrorOverlay()] : []),
    ...(cartographerPlugin ? [cartographerPlugin] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
  server: {
    port,
    strictPort: true,
    host,
    allowedHosts: true,
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
      },
    },
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host,
    allowedHosts: true,
  },
});
