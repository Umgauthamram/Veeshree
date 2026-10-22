import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ["tests/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/types/**",
        "src/**/types.ts",
        "src/cli.ts",
        "src/**/index.ts",
      ],
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 85,
        branches: 80,
      },
    },
  },
});
