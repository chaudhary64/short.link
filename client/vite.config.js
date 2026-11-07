import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const proxyTarget = env.VITE_PROXY_TARGET || "http://localhost:3000";

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // The client calls the API with relative paths in development, so the
      // dev server forwards them to whichever backend VITE_PROXY_TARGET names.
      // This keeps cookies first-party and avoids the deployed CORS allowlist.
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
          cookieDomainRewrite: "",
        },
      },
    },
  };
});
