import { defineConfig } from "vite";

// Relative asset paths so the built dist/ can be dropped into a subpath
// later (e.g. remberllc/public/demos/dsa/) without any base-path config.
export default defineConfig({
  base: "./",
});
