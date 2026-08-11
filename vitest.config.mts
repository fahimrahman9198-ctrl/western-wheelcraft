import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Resolve the "@/..." path aliases from tsconfig.
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
