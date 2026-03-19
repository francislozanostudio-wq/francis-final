import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const githubPagesBase = repoName ? `/${repoName}/` : "/";
const appBasePath = process.env.VITE_BASE_PATH || (process.env.GITHUB_ACTIONS ? githubPagesBase : "/");

export default defineConfig(({ mode }) => ({
  base: appBasePath,
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
