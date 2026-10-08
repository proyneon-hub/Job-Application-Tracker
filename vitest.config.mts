import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Understand the "@/..." import alias from tsconfig.json.
    tsconfigPaths: true,
  },
  test: {
    // Plain Node is fastest for pure logic. Component tests opt into a browser-like DOM
    // with a `// @vitest-environment jsdom` comment at the top of the file.
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
